from flask import Blueprint, request, jsonify
import pandas as pd
import numpy as np
import faiss
from sklearn.preprocessing import StandardScaler
from sklearn.feature_extraction.text import TfidfVectorizer

vector_db_bp = Blueprint('vector_db', __name__)

# Read in the dataset
final_df = pd.read_csv('../data/merged_tracks.csv')

DISPLAY_COLS = ["Title", "Artist", "Album", "ReleaseDate", "ID", "Key", "BPM"]
NUMERIC_COLS = ["Acousticness", "Popularity", "Happiness", "Danceability", "Instrumentalness", "Energy", "Speechiness", "Loudness"]

scaler = StandardScaler()
df_scaled = scaler.fit_transform(final_df[NUMERIC_COLS])

vectorizer = TfidfVectorizer()
tag_embeddings = vectorizer.fit_transform(final_df["Tags"]).toarray()

track_vectors = np.hstack((df_scaled, tag_embeddings))

d = track_vectors.shape[1]
index = faiss.IndexFlatL2(d)

index.add(np.array(track_vectors).astype('float32'))

track_metadata = final_df[["ID", "Title", "Artist", "Album"] + DISPLAY_COLS]

@vector_db_bp.route('/recommend', methods=['GET'])
def recommend():
    song_id = request.args.get('song_id')
    top_k = int(request.args.get('top_k', 5))

    if song_id not in final_df["ID"].values:
        return jsonify({"error": "Song ID not found"}), 400

    song_idx = final_df[final_df["ID"] == song_id].index[0]
    query_vector = np.array([track_vectors[song_idx]]).astype('float32')

    distances, indices = index.search(query_vector, top_k)

    results = track_metadata.iloc[indices[0]].reset_index(drop=True)
    results["Distance"] = distances[0]

    return jsonify(results.to_dict(orient="records"))
