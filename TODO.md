COMPLETE:
- TUNEBAT API TO GET SONG INFORMATION
- RECORD AUDIO VOLUME

TODO:
- SPOTIFY AUTHENTICATION
- RECOMMENDATIONS WITH VECTOR DATABASE
    - SHOULD BE ABLE TO SORT BY GENRE SUBTYPE, KEY, BPM, DATE RELEASED, QUERY FOR ARTISTS
- FRONT END
- SORTING TRACKS BY DIFFERENT GENRES SPECIFICALLY (MARVINS ROOM vs. MAAD CITY)
- THE OVERALL GOAL OF THIS PROJECT IS TO MAKE THE JOB OF DJs EASIER

TUNEBAT INFO:
    id: "Spotify ID"
    n: "Track Title"
    as: ["Artists"]
    l: ---
    an: "Album"
    rd: --- "Release Date"
    is: ---
    ie: ---
    d: "Milliseconds"
    p: --- ? "Popularity -1"
    k: "Key"
    kv: ---
    c: "Camelot Key"
    b: "BPM"
    The below percents have a range of zero to one  inclusive (0 - 1)
    ac: --- ? "Acousticness percent"
    da: "Danceability percent"
    e: "Energy percent"
    h: "Happiness percent"
    i: "Instrumentalness" (probably percent)
    li: "Liveness percent"
    lo: "Loudness dB"
    s: "Speechiness percent" (does this mean signing vs speaking?)
    ci: [{album covers}]
    cr: ---
    r: [---]
    er: [---]