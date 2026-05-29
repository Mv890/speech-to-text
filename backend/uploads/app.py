import os
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
# Enable CORS so your Next.js frontend can talk to this server later
CORS(app)

# Create a safe folder for Windows to store the temporary audio files
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/transcribe', methods=['POST'])
def transcribe():
    # Day 4 Goal: Accept the file
    f = request.files.get('file')
    
    if not f:
        return jsonify({'error': 'no file'}), 400
        
    # Day 4 Goal: Save temporary file
    path = os.path.join(UPLOAD_FOLDER, f.filename)
    f.save(path)
    
    # Day 4 Goal: Return JSON to confirm roundtrip
    return jsonify({
        'status': 'ok', 
        'message': 'received', 
        'filename': f.filename,
        'path': path
    }), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)