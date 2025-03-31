import subprocess
import json
import requests
from flask import Flask, render_template, request, jsonify, session
from flask_socketio import SocketIO
import threading
import time
import os
from dotenv import load_dotenv
from render_audio import audio_recording
from google.cloud import firestore
import uuid

app = Flask(__name__)
app.secret_key = "hi"
socketio = SocketIO(app, cors_allowed_origins="*")
db = firestore.Client(project="muse491")

dotenv_path = os.path.join(os.path.dirname(__file__), '../server/.env')
load_dotenv(dotenv_path)

SPOTIFY_CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID')
SPOTIFY_CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET')
REDIRECT_URI = 'http://127.0.0.1:5000/auth-spotify'  # Flask redirect URI

print(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET)


def start_audio():
    audio_recording(socketio)

threading.Thread(target=start_audio, daemon=True).start()
""" 
The main route of the app. 
Serves the index.html file with the Spotify client ID. 
"""

@app.route('/')
def index():
    return render_template('index.html', client_id=SPOTIFY_CLIENT_ID)


""" 
Authenticates the user with Spotify and fetches their top tracks.
"""
def save_user_top_tracks(user_id, top_tracks):
    db.collection("users").document(user_id).set({"top_tracks": top_tracks})

@app.route('/auth-spotify')
def auth_spotify():
    # print(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET)
    
    code = request.args.get('code') 
    if not code:
        return "Authorization code not found.", 400

    token_url = "https://accounts.spotify.com/api/token"
    payload = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": REDIRECT_URI,
        "client_id": SPOTIFY_CLIENT_ID,
        "client_secret": SPOTIFY_CLIENT_SECRET
    }

    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }

    response = requests.post(token_url, data=payload, headers=headers)

    if response.status_code != 200:
        return jsonify({"error": "Failed to get access token", "details": response.json()}), 400

    token_data = response.json()

    access_token = token_data.get("access_token")
    session["spotify_token"] = access_token

    user_profile = requests.get(
        "https://api.spotify.com/v1/me",
        headers={"Authorization": f"Bearer {access_token}"}
    ).json()
    user_id = user_profile.get("id")

    top_tracks = requests.get(
        "https://api.spotify.com/v1/me/top/tracks?time_range=short_term",
        headers={"Authorization": f"Bearer {access_token}"}
    ).json().get("items", [])

    save_user_top_tracks(user_id, top_tracks)   
    return render_template("index.html", top_tracks=top_tracks, client_id=SPOTIFY_CLIENT_ID)


""" 
Creates a new room on the Node.js server and returns the room ID.
"""

@app.route('/create-room', methods=['POST'])
def create_room():
    print("Headers received:", request.headers)  # Debugging
    print("Raw data received:", request.data)   # Debugging
    print("Parsed JSON:", request.get_json())  # Debugging

    if not request.is_json:
        return jsonify({"error": "Invalid content type. Use 'application/json'"}), 415

    data = request.get_json()
    host_id = data.get("host_id")

    if not host_id:
        return jsonify({"error": "Missing host_id"}), 400

    room_id = str(uuid.uuid4())[:8]  # Shortened UUID (8 chars)

    db.collection("rooms").document(room_id).set({
        "host": host_id,
        "users": []
    })

    return jsonify({"room_id": room_id, "host_id": host_id, "status": "Room created successfully"}), 200



@app.route('/join-room', methods=['POST'])
def join_room():
    user_id = request.json.get("user_id")
    room_id = request.json.get("room_id")

    if not user_id or not room_id:
        return jsonify({"error": "Missing user_id or room_id"}), 400

    room_ref = db.collection("rooms").document(room_id)
    room_ref.update({"users": firestore.ArrayUnion([user_id])})

    return jsonify({"room_id": room_id, "status": "Joined successfully"}), 200



""" 
Search for a song and returns song detalils.
"""
@app.route('/search', methods=['GET'])
def search_song():
    try:
        query = request.args.get('query')  
        result = subprocess.run(['node', '../server/search_song.js', query], capture_output=True, text=True)
        
        print("Raw Node.js stdout:", repr(result.stdout))
        print("Raw Node.js stderr:", repr(result.stderr))       
        
        if result.returncode != 0:
            return jsonify({'error': 'Error executing search', 'details': result.stderr}), 500
        
        try:
            output = json.loads(result.stdout) 
            return jsonify(output) 
        except json.JSONDecodeError as e:
            return jsonify({'error': 'Invalid JSON returned from Node.js', 'details': str(e)}), 500

    except Exception as e:
        return jsonify({'error': 'Error running Node.js script', 'details': str(e)}), 500


if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)

