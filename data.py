import pandas as pd
import numpy as np
import networkx as nx
import matplotlib.pyplot as plt
from sklearn.metrics.pairwise import cosine_similarity

""" 114000, {'track_id', 'artists', 'album_name', 'track_name',
       'popularity', 'duration_ms', 'explicit', 'danceability', 'energy',
       'key', 'loudness', 'mode', 'speechiness', 'acousticness',
       'instrumentalness', 'liveness', 'valence', 'tempo', 'time_signature',
       'track_genre'}"""
tracks = pd.read_csv('../data/tracks.csv')

""" (156422, {'spotify_id', 'name', 'followers', 'popularity', 'genres'})"""
artists = pd.read_csv('../data/nodes.csv')

""" (300386, {'id_0', 'id_1'}) """ 
edges = pd.read_csv('../data/edges.csv')

def artist_graph():
    top_10_artists = artists.sort_values(by='popularity', ascending=False)[:10]
    # print(top_10_artists)

    top_10_ids = set(top_10_artists['spotify_id']) 

    # filter edges that involve the top 10 artists
    filtered_edges = edges[(edges['id_0'].isin(top_10_ids)) | (edges['id_1'].isin(top_10_ids))]

    # creating the graph
    G = nx.Graph()
    
    # add nodes
    for _, row in top_10_artists.iterrows():
        G.add_node(row['spotify_id'], name=row['name'])  # Assuming 'name' is the column for artist names

        # add edges
        G.add_edges_from(filtered_edges[['id_0', 'id_1']].itertuples(index=False, name=None))

        # plot the graph
        plt.figure(figsize=(10, 8))
        pos = nx.spring_layout(G)  # Positions for all nodes
        nx.draw(G, pos, with_labels=True, node_size=700, node_color='skyblue', edge_color='gray', font_size=10)

        # add labels to nodes (artist names)
        labels = {row['spotify_id']: row['name'] for _, row in top_10_artists.iterrows()}
        nx.draw_networkx_labels(G, pos, labels, font_size=12, font_color='black')

        plt.title("Top 10 Artists Graph")
        plt.show()


def get_similar_songs(songlist):
    numeric_features = [
        "acousticness",
        "popularity",
        "danceability", 
        "energy", 
        "speechiness", 
        "loudness", 
        "speech",
        "energy",
        "instrumentalness",
        "valence" 

        "key",
        "mode",
        "tempo",
        "time_signature"
    ]

if __name__ == '__main__':
    # top_10 = tracks.sort_values(by='popularity', ascending=False)[:10]
    # get_similar_songs(top_10)
    print(tracks.shape)
    print(tracks.columns)