import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler
import faiss
from sklearn.feature_extraction.text import TfidfVectorizer
import umap
import json

song_df = pd.read_csv('../data/songs_database.csv')
tags_df = pd.read_csv('../data/track_tags.csv')
final_df = pd.merge(song_df, tags_df[["ID", "Tags"]], on="ID")

final_df.to_csv('../data/merged_tracks.csv',index=False)

DISPLAY_COLS = ["Title","Artist","Album","ReleaseDate","ID", "Key","BPM"]
NUMERIC_COLS = ["Acousticness", "Popularity", "Happiness", "Danceability", "Instrumentalness","Energy","Speechiness", "Loudness"]

scaler = StandardScaler()
df_scaled = scaler.fit_transform(final_df[NUMERIC_COLS])

vectorizer = TfidfVectorizer()
tag_embeddings = vectorizer.fit_transform(final_df["Tags"]).toarray()

track_vectors = np.hstack((df_scaled, tag_embeddings))

d = track_vectors.shape[1]
index = faiss.IndexFlatL2(d)

index.add(np.array(track_vectors).astype('float32'))

track_metadata = final_df[["ID","Title","Artist","Album"] + DISPLAY_COLS]

def find_similar_tracks(song_id, top_k=3):
    song_idx = final_df[final_df["ID"] == song_id].index[0]  # finds index of the song
    query_vector = np.array([track_vectors[song_idx]]).astype('float32')

    distances, indices = index.search(query_vector, top_k)  # FAISS search

    results = track_metadata.iloc[indices[0]].reset_index(drop=True)
    results["Distance"] = distances[0]  # Lower distance = more similar

    return results

def generate_visualization_json(track_vectors, final_df, out_path):
    reducer = umap.UMAP(n_components=2, n_neighbors=15, min_dist=0.1)
    embedding_2d = reducer.fit_transform(track_vectors)

    viz_df = final_df[["ID", "Title", "Artist"]].copy()
    viz_df["x"] = embedding_2d[:, 0]
    viz_df["y"] = embedding_2d[:, 1]

    with open(out_path, "w") as f:
        json.dump(viz_df.to_dict(orient="records"), f, indent=2)
