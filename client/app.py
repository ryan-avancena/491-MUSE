import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'ml')))

from flask import Flask, request, render_template, redirect, url_for
from flask_socketio import SocketIO, join_room, leave_room, send
from dotenv import load_dotenv
import threading
# from render_audio import audio_recording
import pandas as pd 
import requests
import subprocess

# blueprints
# from routes.auth import auth_bp
# from routes.room import room_bp
from routes.search import search_bp
from routes.vector_db import vector_db_bp

from get_soundcloud_likes import get_likes
from embeddings import create_vector_db, generate_visualization_json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")

dotenv_path = os.path.join(os.path.dirname(__file__), '../server/.env')
load_dotenv(dotenv_path)

SPOTIFY_CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID')

# def start_audio():
#     audio_recording(socketio)

# threading.Thread(target=start_audio, daemon=True).start()

# app.register_blueprint(auth_bp)
# app.register_blueprint(room_bp)
app.register_blueprint(search_bp)
app.register_blueprint(vector_db_bp)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/submit-soundcloud',methods=['POST'])
def submit_soundcloud():
    soundcloud_username = request.form['soundcloud_username']
    print("Received SoundCloud username:", soundcloud_username)

    try:
        get_likes(soundcloud_username)
        requests.post("http://localhost:3000/create-embed-db")
        subprocess.run(['node', '../server/create_embed_db.js'], check=True)
        track_vectors, final_df, index, track_metadata = create_vector_db()
        final_df.to_csv('../data/merged_tracks.csv', index=False)
        generate_visualization_json(track_vectors, final_df, "../client/static/data/visualization_embeddings.json")

        return redirect(url_for('dj'))

    except Exception as e:
        return f"An error occurred during processing: {e}", 500

@app.route('/dj')
def dj():
    df = pd.read_csv('../data/merged_tracks.csv')
    tracks = df[["ID","Title", "Artist", "Key", "BPM", "Camelot", "Tags"]].to_dict(orient="records")
    return render_template('dj.html',tracks=tracks)

@app.route('/user')
def user():
    return render_template('user.html', client_id=SPOTIFY_CLIENT_ID)

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
