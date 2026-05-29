from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
# This allows your Next.js app to send data to this server safely
CORS(app)
@app.route('/', methods=['GET'])
def home():
    return "The AI Speech-to-Text backend is running! Try going to /api/status", 200

@app.route('/api/status', methods=['GET'])
def health_check():
    return jsonify({
        "status": "online",
        "message": "AI Speech-to-Text Python server is running!"
    }), 200

@app.route('/api/transcribe', methods=['POST'])
def transcribe_audio():
    # Check if an audio file was actually sent in the request
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
    
    audio_file = request.files['audio']
    
    # We will add the actual AI transcription logic here later!
    # For now, we will just pretend it worked to test the connection.
    
    return jsonify({
        "status": "success",
        "transcript": f"Successfully received file: {audio_file.filename}. Ready for AI processing!"
    }), 200

if __name__ == '__main__':
    # Running on port 5000 so it doesn't crash into Next.js on port 3000
    app.run(debug=True, port=5000)