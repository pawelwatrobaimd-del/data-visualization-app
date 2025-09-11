import os
import json
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

# Inicjalizacja aplikacji Flask
app = Flask(__name__, static_folder='build')
CORS(app, resources={r"/api/*": {"origins": "*"}}) 

# Ustawienie ścieżek
# Użyj os.path.dirname(__file__) aby upewnić się, że ścieżka jest relatywna do pliku server.py
PUBLIC_FOLDER = os.path.join(os.path.dirname(__file__), 'public')
METADATA_FILE = os.path.join(PUBLIC_FOLDER, 'metadata.json')
USERS_FILE = os.path.join(os.path.dirname(__file__), 'users.json')

# Wczytaj dane użytkowników do pamięci (in-memory cache)
# WAŻNE: W tej wersji, dane użytkowników są tylko do odczytu
# i nie są zapisywane z powrotem do pliku na GAE.
# Dane są stałe i zakodowane w kodzie.
users_in_memory = {
    "admin": {"password": "adminpassword", "role": "admin"},
    "pawelw": {"password": "konkurs2", "role": "user"},
    "paweld": {"password": "pawel2025", "role": "user"},
    "marcelina": {"password": "marcelina2025", "role": "user"}
}

def load_metadata():
    if os.path.exists(METADATA_FILE):
        with open(METADATA_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_metadata(data):
    # Ta funkcja nie będzie działać na GAE, gdzie system plików jest tylko do odczytu.
    # W Twoim przypadku (dane stałe) nie ma to znaczenia.
    with open(METADATA_FILE, 'w') as f:
        json.dump(data, f, indent=4)

# Endpointy API
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    user = users_in_memory.get(username)
    if user and user['password'] == password:
        return jsonify({"message": "Login successful", "role": user['role']}), 200
    return jsonify({"message": "Invalid credentials"}), 401

@app.route('/api/list-json-files', methods=['GET'])
def list_json_files():
    metadata = load_metadata()
    files = []
    if os.path.exists(PUBLIC_FOLDER):
        for filename in os.listdir(PUBLIC_FOLDER):
            if filename.endswith('.json') and filename != 'metadata.json':
                timestamp = metadata.get(filename, 'Brak daty')
                files.append({'name': filename, 'timestamp': timestamp})
    return jsonify(files), 200

@app.route('/api/upload-json', methods=['POST'])
def upload_json():
    if 'file' not in request.files:
        return jsonify({"message": "Brak pliku"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"message": "Nie wybrano pliku"}), 400
    
    filename = secure_filename(file.filename)
    action = request.form.get('action')
    old_filename = request.form.get('old_filename')
    
    metadata = load_metadata()
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    if action == 'add':
        filepath = os.path.join(PUBLIC_FOLDER, filename)
        file.save(filepath)
        metadata[filename] = timestamp
    elif action == 'replace' and old_filename:
        if old_filename in metadata:
            os.remove(os.path.join(PUBLIC_FOLDER, old_filename))
            filepath = os.path.join(PUBLIC_FOLDER, filename)
            file.save(filepath)
            metadata.pop(old_filename, None)
            metadata[filename] = timestamp
        else:
            return jsonify({"message": "Plik do zastąpienia nie istnieje"}), 404
    else:
        return jsonify({"message": "Niepoprawna akcja"}), 400

    save_metadata(metadata)
    return jsonify({"message": "Plik pomyślnie wgrany", "filename": filename, "timestamp": timestamp}), 200

# Endpointy do zarządzania użytkownikami
@app.route('/api/users', methods=['GET'])
def get_users():
    users_public_data = {username: {'role': user['role']} for username, user in users_in_memory.items()}
    return jsonify(users_public_data), 200

@app.route('/api/users', methods=['POST'])
def add_user():
    return jsonify({"message": "Zapis użytkowników nie jest wspierany na tej platformie"}), 501

@app.route('/api/users/<string:username>', methods=['DELETE'])
def delete_user(username):
    return jsonify({"message": "Usuwanie użytkowników nie jest wspierane na tej platformie"}), 501

@app.route('/api/users/<string:username>', methods=['PUT'])
def update_user(username):
    return jsonify({"message": "Aktualizacja użytkowników nie jest wspierana na tej platformie"}), 501

# Serwowanie plików statycznych frontendu
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True, port=8080)