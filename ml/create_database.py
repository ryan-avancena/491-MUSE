import requests
import subprocess
from get_soundcloud_likes import get_likes
from embeddings import create_vector_db, find_similar_tracks, generate_visualization_json

USERNAME = 'nathan-wang-6'

get_likes(USERNAME)

response = requests.post("http://localhost:3000/create-embed-db")  # or whatever your endpoint is

try:
    result = subprocess.run(['node', '../server/create_embed_db.js'], check=True, capture_output=True, text=True)
    print("Script output:", result.stdout)
except subprocess.CalledProcessError as e:
    print("Error:", e.stderr)

track_vectors, final_df, index, track_metadata = create_vector_db()
# results = find_similar_tracks("some_song_id", track_vectors, final_df, index, track_metadata)
# generate_visualization_json(track_vectors, final_df, "../data/umap_tracks.json")
generate_visualization_json(track_vectors, final_df, "../client/static/data/visualization_embeddings.json")