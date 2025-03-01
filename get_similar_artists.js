import dotenv from 'dotenv';
dotenv.config();

const LAST_FM_KEY = process.env.LAST_FM_API_KEY;

if (!LAST_FM_KEY) {
    console.error("LAST_FM_API_KEY is missing in the .env file");
    process.exit(1);
}

const ARTIST = ["50+Cent"]

// get similar artists
const similar_url = `https://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=${ARTIST}&api_key=${LAST_FM_KEY}&format=json`;
const artist_tags_url = `https://ws.audioscrobbler.com/2.0/?method=artist.gettoptags&artist=${ARTIST}&api_key=${LAST_FM_KEY}&format=json`

console.log("URL:", artist_tags_url);
