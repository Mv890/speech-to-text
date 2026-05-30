import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# 1. Grab the Deepgram key from the environment
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "status": "online", 
        "message": "AI Speech-to-Text API is awake and ready for audio!"
    }), 200

@app.route('/transcribe', methods=['POST'])
def transcribe():
    f = request.files.get('audio') or request.files.get('file')
    if not f:
        return jsonify({'error': 'no file provided'}), 400
        
    path = os.path.join(UPLOAD_FOLDER, f.filename)
    f.save(path)
    
    if not DEEPGRAM_API_KEY:
        return jsonify({'error': 'API key is missing in .env file!'}), 500

    try:
        # Open the saved audio file in binary mode
        with open(path, 'rb') as audio_file:
            
            # 2. Point to Deepgram's Nova-2 model with smart punctuation
            url = "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true"
            
            # Deepgram uses "Token" instead of "Bearer"
            headers = {
                "Authorization": f"Token {DEEPGRAM_API_KEY}",
                "Content-Type": "audio/webm"
            }
            
            # Send the raw audio file directly
            response = requests.post(url, headers=headers, data=audio_file)
            response_data = response.json()

            # Catch any API errors
            if response.status_code != 200:
                print("\n\n--- DEEPGRAM ERROR ---")
                print(response_data)
                print("-----------------------\n\n")
                return jsonify({'error': 'AI Provider failed', 'details': response_data}), 500

            # 3. Deepgram puts the text deep inside their JSON response, we extract it here:
            real_transcript = response_data['results']['channels'][0]['alternatives'][0]['transcript']

            return jsonify({
                'status': 'success',
                'transcript': real_transcript
            }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)