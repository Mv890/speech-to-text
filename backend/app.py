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

DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")

# --- DAY 7: ROBUST SECURITY GUARDS & VALIDATIONS ---
MAX_FILE_SIZE = 10 * 1024 * 1024  # Strict 10MB limit guard
ALLOWED_EXTENSIONS = {'webm', 'wav', 'mp3', 'm4a', 'ogg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "status": "online", 
        "message": "AI Speech-to-Text API is awake and ready for audio!"
    }), 200

@app.route('/transcribe', methods=['POST'])
def transcribe():
    # 1. VALIDATION: Check if file exists in request
    f = request.files.get('audio') or request.files.get('file')
    if not f:
        return jsonify({'error': 'No audio file provided in the request.'}), 400
    
    # 2. VALIDATION: Validate file extension type
    if not allowed_file(f.filename):
        return jsonify({'error': f'Unsupported file format. Allowed: {", ".join(ALLOWED_EXTENSIONS)}'}), 400

    # 3. VALIDATION: File size guard check
    file_bytes = f.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        return jsonify({'error': 'Audio file is too large! Maximum limit is 10MB.'}), 413
    
    # Reset file pointer after checking size so we can save it safely
    f.seek(0)
        
    path = os.path.join(UPLOAD_FOLDER, f.filename)
    f.save(path)
    
    if not DEEPGRAM_API_KEY:
        return jsonify({'error': 'Server configuration error: API key is missing!'}), 500

    try:
        # --- ROBUST STREAMING STRATEGY ---
        with open(path, 'rb') as audio_file:
            url = "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true"
            
            headers = {
                "Authorization": f"Token {DEEPGRAM_API_KEY}",
                "Content-Type": "audio/webm"  # Deepgram handles webm natively!
            }
            
            response = requests.post(url, headers=headers, data=audio_file)
            response_data = response.json()

            # Server-side validation check on external API response
            if response.status_code != 200:
                print("\n\n--- DEEPGRAM API ERROR ---")
                print(response_data)
                print("--------------------------\n\n")
                return jsonify({'error': 'AI cloud provider rejected the request.', 'details': response_data}), 500

            # Extract the speech transcript from response structure safely
            real_transcript = response_data['results']['channels'][0]['alternatives'][0]['transcript']

        # --- WINDOWS FILE LOCK FIX --- 
        # Python closes the file automatically because we left the 'with open()' block.
        # Now it is safe to delete it without Windows yelling at us!
        if os.path.exists(path):
            os.remove(path)

        return jsonify({
            'status': 'success',
            'transcript': real_transcript
        }), 200

    except Exception as e:
        return jsonify({'error': f'Internal server exception: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)