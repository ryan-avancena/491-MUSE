import dotenv from 'dotenv';
dotenv.config();

const LAST_FM_KEY = process.env.LAST_FM_API_KEY;

if (!LAST_FM_KEY) {
    console.error("LAST_FM_API_KEY is missing in the .env file");
    process.exit(1);
}

var ARTIST = "Knock2"
var TAG = "hip-hop"
var TRACK = ""
var LIMIT = ""
var PAGE_NUM = ""

// get similar artists
const similar_artist_url = `https://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=${ARTIST}&api_key=${LAST_FM_KEY}&format=json`;
const artist_tags_url = `https://ws.audioscrobbler.com/2.0/?method=artist.gettoptags&artist=${ARTIST}&api_key=${LAST_FM_KEY}&format=json`;
// const similar_track_url = `https://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist=${ARTIST}&track=${TRACK}&api_key=${LAST_FM_KEY}&format=json`;
// const get_top_track_tags_url = `https://ws.audioscrobbler.com/2.0/?method=track.gettoptags&artist=${ARTIST}&track=${TRACK}&api_key=${LAST_FM_KEY}&format=json`;
// const get_track_tags_url = `https://ws.audioscrobbler.com/2.0/?method=track.getTags&api_key=${LAST_FM_KEY}&artist=${ARTIST}&track=${TRACK}&user=RJ&format=json`;
// const get_top_artist_with_tag = `https://ws.audioscrobbler.com/2.0/?method=tag.gettopartists&tag=${TAG}&api_key=${LAST_FM_KEY}&limit=${}&page=${}&format=json`;

console.log("URL:", artist_tags_url);
