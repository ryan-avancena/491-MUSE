import pandas as pd
import numpy as np 
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
import nltk

from nltk.tokenize import word_tokenize
from gensim.models import Word2Vec

IDENTIFIERS = [
    "track_id",
    "artists",
    "album_name",
    "track_name",
    "track_genre"
]

THEORY_IDENTIFIERS = [
    "key",
    "mode",
    "tempo",
    "time_signature"
]

NUMERIC_FEATURES = [
    "acousticness",
    "popularity",
    "danceability", 
    "energy", 
    "speechiness", 
    "loudness", 
    "speechiness",
    "energy",
    "instrumentalness",
    "valence", 
]

GENRE_GROUPS = {
    "acoustic": ["acoustic", "singer-songwriter", "songwriter", "guitar"],
    "edm": ["house", "progressive-house", "techno", "trance", "electronic", "dubstep", "deep-house", "club", "detroit-techno", "minimal-techno"],
    "rock": ["alt-rock", "alternative", "hard-rock", "punk-rock", "punk", "psych-rock", "grunge", "emo", "indie", "indie-pop", "j-rock"],
    "pop": ["pop", "power-pop", "indie-pop", "k-pop", "mandopop", "j-pop", "cantopop"],
    "hip-hop": ["hip-hop", "r-n-b"],
    "classical": ["classical", "piano", "opera"],
    "metal": ["black-metal", "death-metal", "heavy-metal", "metal", "metalcore", "hardcore", "grindcore"],
    "folk": ["folk", "bluegrass"],
    "jazz": ["jazz"],
    "country": ["country", "honky-tonk"],
    "latin": ["latin", "latino", "samba", "salsa", "pagode", "sertanejo", "mpb", "brazil"],
    "reggae": ["reggae", "dub", "dancehall", "ska"],
    "world": ["afrobeat", "turkish", "iranian", "malay", "world-music", "french", "german", "swedish", "spanish"],
    "ambient": ["ambient", "chill", "study", "sleep", "new-age"],
    "kids": ["children", "disney", "kids"],
    "comedy": ["comedy", "party", "happy", "romance", "show-tunes"],
    "other": ["anime", "j-dance", "j-idol", "british", "detroit-techno", "breakbeat"],
}

class Helper:
    def fix_artists(self,artist_list):
        if isinstance(artist_list, str): 
            artists = artist_list.split(';')  # split by semicolon
            return ', '.join(artist.strip() for artist in artists)  
        elif isinstance(artist_list, list):  # if it's already a list
            return ', '.join(str(artist) for artist in artist_list)  # join them with commas
        return ""
    
    def group_by_genre(self,tracks):
        genre_to_category = {}
        for category, genres in GENRE_GROUPS.items():
            for genre in genres:
                genre_to_category[genre] = category

        tracks["genre_category"] = tracks["track_genre"].map(genre_to_category)
        tracks["genre_category"] = tracks["genre_category"].fillna("other")
 
        return tracks

    def get_embedding(self,song_desc_tokens, model, EMBEDDING_DIM):
        vectors = [model.wv[token] for token in song_desc_tokens if token in model.wv]

        return sum(vectors) / len(vectors) if vectors else [0] * EMBEDDING_DIM

    def show_embeddings(self,embeddings):
        print("Num Embeddings:", len(embeddings))
        print("Embedding Size:", len(embeddings[0]))
        return list(embeddings[0])


if __name__ == '__main__':
    tracks = pd.read_csv('../data/tracks.csv')
    preprocessing = Helper()

    tracks["artists"] = [preprocessing.fix_artists(artist) for artist in tracks["artists"]]
    
    tracks.insert(
        0, "song_description", tracks["track_name"] + " - " + tracks["artists"]
    )

    tracks = preprocessing.group_by_genre(tracks)


    tokenized_song_descs = [word_tokenize(str(v).lower()) for v in tracks["song_description"]]

    # print(tokenized_song_descs)

    scaler = StandardScaler()

    EMBEDDING_DIM = len(NUMERIC_FEATURES)

    model = Word2Vec(
        sentences=tokenized_song_descs,
        vector_size=EMBEDDING_DIM,
        window=5,
        min_count=1,
        sg=1
    )

    categorical_embeddings = [
        preprocessing.get_embedding(song_descs, model, EMBEDDING_DIM) for song_descs in tokenized_song_descs
    ]

    numeric_embeddings = scaler.fit_transform(tracks[NUMERIC_FEATURES])

    row_embeddings = [
        np.concatenate([cat_row, num_row]) for cat_row, num_row in zip(categorical_embeddings, numeric_embeddings)
    ]

    # print(row_embeddings.head())

    embedded_songs = tracks[IDENTIFIERS + THEORY_IDENTIFIERS].copy()

    embedded_songs["song_embeddings"] = row_embeddings

    print(embedded_songs.head())

    # a = preprocessing.show_embeddings(categorical_embeddings)
    # print(a)

    # print(categorical_embeddings)



# genre_tracks = {}
# for genre, group in genre_groups.items():
#     genre_tracks[genre] = scaled_tracks[scaled_tracks["track_genre"].isin(group)]

# scaler = StandardScaler()
# scaled_features = scaler.fit_transform(tracks[numeric_features])
# scaled_tracks = pd.DataFrame(scaled_features, columns=numeric_features)

# scaled_tracks["track_id"] = tracks["track_id"]
# scaled_tracks["artists"] = tracks["artists"]
# scaled_tracks["track_name"] = tracks["track_name"]
# scaled_tracks["album_name"] = tracks["album_name"]
# scaled_tracks["track_genre"] = tracks["track_genre"]
# scaled_tracks["genre_category"] = tracks["genre_category"]
# scaled_tracks["song_description"] = tracks["song_description"]
