import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler

tracks = pd.read_csv('../data/tracks.csv')

identifiers = [
    "track_id",
    "artists",
    "album_name",
    "track_name",
    "track_genre"
]

theory_identifiers = [
    "key",
    "mode",
    "tempo",
    "time_signature"
]

numeric_features = [
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

genre_groups = {
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

def fix_artists(artist_list):
    if isinstance(artist_list, str): 
        artists = artist_list.split(';')  # split by semicolon
        return ', '.join(artist.strip() for artist in artists)  
    elif isinstance(artist_list, list):  # if it's already a list
        return ', '.join(str(artist) for artist in artist_list)  # join them with commas
    return ""


tracks["artists"] = tracks["artists"].apply(lambda v: fix_artists(v))
tracks.insert(
    0, "song_description", tracks["track_name"] + " - " + tracks["artists"]
)

genre_to_category = {}
for category, genres in genre_groups.items():
    for genre in genres:
        genre_to_category[genre] = category

tracks["genre_category"] = tracks["track_genre"].map(genre_to_category)
tracks["genre_category"] = tracks["genre_category"].fillna("other")

scaler = StandardScaler()
scaled_features = scaler.fit_transform(tracks[numeric_features])
scaled_tracks = pd.DataFrame(scaled_features, columns=numeric_features)

scaled_tracks["track_id"] = tracks["track_id"]
scaled_tracks["artists"] = tracks["artists"]
scaled_tracks["track_name"] = tracks["track_name"]
scaled_tracks["album_name"] = tracks["album_name"]
scaled_tracks["track_genre"] = tracks["track_genre"]
scaled_tracks["genre_category"] = tracks["genre_category"]
scaled_tracks["song_description"] = tracks["song_description"]

genre_tracks = {}
for genre, group in genre_groups.items():
    genre_tracks[genre] = scaled_tracks[scaled_tracks["track_genre"].isin(group)]

print(genre_tracks['acoustic'].head())