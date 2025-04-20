import requests
import subprocess
from get_soundcloud_likes import get_likes


USERNAME = 'malcolm-makkonen'

get_likes(USERNAME)

response = requests.post("http://localhost:3000/create-embed-db")  # or whatever your endpoint is

try:
    result = subprocess.run(['node', '../server/create_embed_db.js'], check=True, capture_output=True, text=True)
    print("Script output:", result.stdout)
except subprocess.CalledProcessError as e:
    print("Error:", e.stderr)

