import eventlet
eventlet.monkey_patch()

import os
import json
import websocket
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
active_tunnels = {}

@app.route('/', methods=['GET'])
def home():
    return jsonify({"status": "online", "message": "WebSocket Server is LIVE!"}), 200

@socketio.on('connect')
def handle_connect():
    client_sid = request.sid 
    print(f"\n🟢 Client Connected: {client_sid}")
    
    def on_message(ws, message):
        data = json.loads(message)
        if data.get('type') == 'Error':
            print(f"❌ DEEPGRAM REJECTED AUDIO: {data.get('err_msg')}")
            return

        if data.get('channel') and data['channel']['alternatives'][0]['transcript']:
            transcript = data['channel']['alternatives'][0]['transcript']
            is_final = data.get('is_final', False)
            print(f"🧠 AI HEARD: {transcript}")
            socketio.emit('transcript_update', {'text': transcript, 'is_final': is_final}, to=client_sid)

    def on_error(ws, error):
        if "sock" in str(error):
            return
        print(f"⚠️ Deepgram Error: {error}")

    def on_close(ws, close_status_code, close_msg):
        print("🔴 Deepgram Tunnel Closed")

    def on_open(ws):
        print("🚀 Deepgram Tunnel Opened! (Audio streaming ready)")
        # THIS IS THE FIX: Send the green light to React!
        socketio.emit('deepgram_ready', to=client_sid)

    # NATIVE KEEPALIVE ADDED TO URL! Deepgram will never hang up due to silence now.
    dg_url = "wss://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&interim_results=true&keepalive=true"
    
    dg_ws = websocket.WebSocketApp(
        dg_url,
        header=[f'Authorization: Token {DEEPGRAM_API_KEY}'],
        on_message=on_message,
        on_error=on_error,
        on_close=on_close,
        on_open=on_open 
    )
    
    socketio.start_background_task(dg_ws.run_forever)
    active_tunnels[client_sid] = dg_ws

@socketio.on('audio_chunk')
def handle_audio(data):
    print(f"🎤 Received {len(data)} bytes! Routing to AI...", end="\r")
    
    dg_ws = active_tunnels.get(request.sid)
    if dg_ws:
        try:
            dg_ws.send(data, opcode=websocket.ABNF.OPCODE_BINARY)
        except Exception as e:
            print(f"⚠️ Failed to route to Deepgram: {e}")

@socketio.on('disconnect')
def handle_disconnect():
    print(f"\n🔴 Client Disconnected: {request.sid}")
    dg_ws = active_tunnels.pop(request.sid, None)
    if dg_ws:
        dg_ws.close()

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000)