from flask import Flask, render_template
from flask_socketio import SocketIO, join_room, leave_room, send
import os
from dotenv import load_dotenv
from google.cloud import firestore
import threading
from render_audio import audio_recording
import pandas as pd 

# blueprints
from routes.auth import auth_bp
from routes.room import room_bp
from routes.search import search_bp
from routes.vector_db import vector_db_bp

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")
db = firestore.Client(project="muse491")
rooms = {}  

dotenv_path = os.path.join(os.path.dirname(__file__), '../server/.env')
load_dotenv(dotenv_path)

SPOTIFY_CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID')

def start_audio():
    audio_recording(socketio)

threading.Thread(target=start_audio, daemon=True).start()

app.register_blueprint(auth_bp)
app.register_blueprint(room_bp)
app.register_blueprint(search_bp)
app.register_blueprint(vector_db_bp)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/dj')
def dj():
    df = pd.read_csv('../data/merged_tracks.csv')
    tracks = df[["Title", "Artist", "Key", "BPM", "Tags"]].to_dict(orient="records")
    return render_template('dj.html',tracks=tracks)

@app.route('/user')
def user():
    return render_template('user.html', client_id=SPOTIFY_CLIENT_ID)

@socketio.on('join')
def handle_join(data):
    room_id = data['room_id']
    user_id = data['user_id']
    
    join_room(room_id)
    rooms.setdefault(room_id, []).append(user_id)  # Track users in rooms
    send({'msg': f'{user_id} joined room {room_id}'}, room=room_id)

@socketio.on('leave')
def handle_leave(data):
    room_id = data['room_id']
    user_id = data['user_id']
    
    leave_room(room_id)

    if room_id in rooms and user_id in rooms[room_id]:
        rooms[room_id].remove(user_id)
        if not rooms[room_id]:
            del rooms[room_id]

    send({'msg': f'{user_id} left room {room_id}'}, room=room_id)

@socketio.on('song_request')
def handle_song_request(data):
    room_id = data['room_id']
    song_name = data['song']
    user_id = data['user_id']

    send({'msg': f"{user_id} requested: {song_name}"}, room=room_id)
if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
