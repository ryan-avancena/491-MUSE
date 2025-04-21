# from flask import Blueprint, request, session, jsonify, render_template
# import requests
# import os
# from google.cloud import firestore

# auth_bp = Blueprint('auth', __name__)
# db = firestore.Client(project="muse491")

# SPOTIFY_CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID')
# SPOTIFY_CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET')
# REDIRECT_URI = 'http://127.0.0.1:5000/auth-spotify'

# def save_user_top_tracks(user_id, top_tracks):
#     db.collection("users").document(user_id).set({"top_tracks": top_tracks})

# @auth_bp.route('/auth-spotify')
# def auth_spotify():
#     code = request.args.get('code') 
#     if not code:
#         return "Authorization code not found.", 400

#     token_url = "https://accounts.spotify.com/api/token"
#     payload = {
#         "grant_type": "authorization_code",
#         "code": code,
#         "redirect_uri": REDIRECT_URI,
#         "client_id": SPOTIFY_CLIENT_ID,
#         "client_secret": SPOTIFY_CLIENT_SECRET
#     }

#     headers = {"Content-Type": "application/x-www-form-urlencoded"}
#     response = requests.post(token_url, data=payload, headers=headers)

#     if response.status_code != 200:
#         return jsonify({"error": "Failed to get access token", "details": response.json()}), 400

#     token_data = response.json()
#     access_token = token_data.get("access_token")
#     session["spotify_token"] = access_token

#     user_profile = requests.get(
#         "https://api.spotify.com/v1/me",
#         headers={"Authorization": f"Bearer {access_token}"}
#     ).json()
#     user_id = user_profile.get("id")

#     top_tracks = requests.get(
#         "https://api.spotify.com/v1/me/top/tracks?time_range=short_term",
#         headers={"Authorization": f"Bearer {access_token}"}
#     ).json().get("items", [])

#     save_user_top_tracks(user_id, top_tracks)
    
#     return render_template("user.html", top_tracks=top_tracks)
