import subprocess
import json
import requests
from flask import Flask, render_template, request, jsonify, session
import os
from dotenv import load_dotenv

app = Flask(__name__)
app.secret_key = "hi"

dotenv_path = os.path.join(os.path.dirname(__file__), '../server/.env')

# Load the .env file
load_dotenv(dotenv_path)

SPOTIFY_CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID')
SPOTIFY_CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET')
REDIRECT_URI = 'http://127.0.0.1:5000/auth-spotify'  # Flask redirect URI

print(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET)

# Homepage route
@app.route('/')
def index():
    return render_template('index.html', client_id=SPOTIFY_CLIENT_ID)


@app.route('/auth-spotify')
def auth_spotify():
    print(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET)
    
    code = request.args.get('code')  # Get the authorization code from Spotify

    if not code:
        return "Authorization code not found.", 400

    # Exchange the code for an access token
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

    # Request to exchange the code for an access token
    response = requests.post(token_url, data=payload, headers=headers)

    if response.status_code != 200:
        return jsonify({"error": "Failed to get access token", "details": response.json()}), 400

    token_data = response.json()
    access_token = token_data.get("access_token")
    
    # Store access token in session
    session["spotify_token"] = access_token

    # Fetch user's top tracks
    top_tracks_url = "https://api.spotify.com/v1/me/top/tracks"
    top_tracks_headers = {"Authorization": f"Bearer {access_token}"}
    top_tracks_response = requests.get(top_tracks_url, headers=top_tracks_headers)

    if top_tracks_response.status_code != 200:
        return jsonify({"error": "Failed to get top tracks", "details": top_tracks_response.json()}), 400

    top_tracks_data = top_tracks_response.json()
    
    return render_template("index.html", top_tracks=top_tracks_data["items"], client_id=SPOTIFY_CLIENT_ID)


@app.route('/top-tracks')
def get_top_tracks():
    access_token = session.get('spotify_access_token')  # Retrieve token from session
    
    if not access_token:
        return jsonify({"error": "No access token found. Authenticate first."}), 401

    url = "https://api.spotify.com/v1/me/top/tracks"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        return jsonify({"error": "Failed to fetch top tracks", "details": response.json()}), 400

    return jsonify(response.json())  # Return top tracks data


@app.route('/create-room', methods=['POST','GET'])
def create_room():
    try:
        # Send POST request to Node.js server
        response = requests.get("http://localhost:3000/create-room")  # Ensure Node.js is running on port 3000
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        return jsonify({'error': 'Failed to reach Node.js server', 'details': str(e)}), 500

@app.route('/search', methods=['GET'])
def search_song():
    try:
        query = request.args.get('query')  # Get the query parameter from the URL

        # Run your Node.js script and capture the result
        result = subprocess.run(['node', '../server/search_song.js', query], capture_output=True, text=True)
        
        print("Raw Node.js stdout:", repr(result.stdout))
        print("Raw Node.js stderr:", repr(result.stderr))       
        
        if result.returncode != 0:
            return jsonify({'error': 'Error executing search', 'details': result.stderr}), 500
        
        # Try to parse the JSON output from Node.js
        try:
            output = json.loads(result.stdout)  # Parse the JSON output
            return jsonify(output)  # Return as valid Flask response (JSON)
        except json.JSONDecodeError as e:
            return jsonify({'error': 'Invalid JSON returned from Node.js', 'details': str(e)}), 500

    except Exception as e:
        return jsonify({'error': 'Error running Node.js script', 'details': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
