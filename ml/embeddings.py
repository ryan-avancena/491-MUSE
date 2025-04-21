import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler
import faiss
from sklearn.feature_extraction.text import TfidfVectorizer
import umap
import json
import csv


def create_vector_db():
    song_df = pd.read_csv('../data/songs_database.csv')
    tags_df = pd.read_csv('../data/track_tags.csv', quoting=csv.QUOTE_ALL)
    final_df = pd.merge(song_df, tags_df[["ID", "Tags"]], on="ID")
    final_df = final_df.drop_duplicates(subset='ID')
    final_df = final_df.drop_duplicates(subset=['Title', 'Artist'], keep='first')  
    final_df.to_csv('../data/merged_tracks.csv', index=False)

    DISPLAY_COLS = ["Title","Artist","Album","ReleaseDate","ID", "Key","BPM"]
    NUMERIC_COLS = ["Acousticness", "Popularity", "Happiness", "Danceability", "Instrumentalness", "Energy", "Speechiness", "Loudness"]

    scaler = StandardScaler()
    df_scaled = scaler.fit_transform(final_df[NUMERIC_COLS])

    vectorizer = TfidfVectorizer()
    tag_embeddings = vectorizer.fit_transform(final_df["Tags"]).toarray()

    track_vectors = np.hstack((df_scaled, tag_embeddings))

    d = track_vectors.shape[1]
    index = faiss.IndexFlatL2(d)
    index.add(track_vectors.astype('float32'))

    track_metadata = final_df[["ID","Title","Artist","Album"] + DISPLAY_COLS]

    return track_vectors, final_df, index, track_metadata


def find_similar_tracks(song_id, track_vectors, final_df, index, track_metadata, top_k=3):
    song_idx = final_df[final_df["ID"] == song_id].index[0]
    query_vector = np.array([track_vectors[song_idx]]).astype('float32')
    distances, indices = index.search(query_vector, top_k)
    
    results = track_metadata.iloc[indices[0]].reset_index(drop=True)
    results["Distance"] = distances[0]
    return results


def generate_visualization_json(track_vectors, final_df, out_path):
    reducer = umap.UMAP(n_components=3, random_state=42)
    embedding_3d = reducer.fit_transform(track_vectors)

    viz_df = final_df[["ID", "Title", "Artist"]].copy()
    viz_df["x"] = embedding_3d[:, 0]
    viz_df["y"] = embedding_3d[:, 1]
    viz_df["z"] = embedding_3d[:, 2]

    with open(out_path, "w") as f:
        json.dump(viz_df.to_dict(orient="records"), f, indent=2)

track_vectors, final_df, index, track_metadata = create_vector_db()
generate_visualization_json(track_vectors, final_df, "../client/static/data/visualization_embeddings.json")