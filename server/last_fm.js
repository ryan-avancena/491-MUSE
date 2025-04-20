/* last_fm.js

- testing last.fm api calls

*/

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const LAST_FM_KEY = process.env.LAST_FM_API_KEY;

if (!LAST_FM_KEY) {
    console.error("LAST_FM_API_KEY is missing in the .env file");
    process.exit(1);
}

var ARTIST = "MEDUZA"
var TRACK = "luther"

ARTIST = encodeURIComponent(ARTIST);
TRACK = encodeURIComponent(TRACK);

// get similar artists
// const similar_artist_url = `https://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=${ARTIST}&api_key=${LAST_FM_KEY}&format=json`;
const artist_tags_url = `https://ws.audioscrobbler.com/2.0/?method=artist.gettoptags&artist=${ARTIST}&api_key=${LAST_FM_KEY}&format=json`;
// const similar_track_url = `https://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist=${ARTIST}&track=${TRACK}&api_key=${LAST_FM_KEY}&format=json`;
// const get_top_track_tags_url = `https://ws.audioscrobbler.com/2.0/?method=track.gettoptags&artist=${ARTIST}&track=${TRACK}&api_key=${LAST_FM_KEY}&format=json`;
// const get_top_track_tags_url = `https://ws.audioscrobbler.com/2.0/?method=track.getTopTags&artist=${ARTIST}&track=${TRACK}&api_key=${LAST_FM_KEY}&format=json`;
// const get_top_artist_with_tag = `https://ws.audioscrobbler.com/2.0/?method=tag.gettopartists&tag=${TAG}&api_key=${LAST_FM_KEY}&limit=${}&page=${}&format=json`;

console.log("URL:", artist_tags_url);

async function fetchTags() {
    try {
        const response = await fetch(artist_tags_url);
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const data = await response.json();

        // console.log(data)

        // Check if the response contains tags and display them
        if (data.toptags && data.toptags.tag) {
            console.log("Track Tags:");
            const topTags = data.toptags.tag.slice(0, 5);

            topTags.forEach((tag, index) => {
                console.log(`${index + 1}: ${tag.name}`);
            });
        } else {
            console.log("No tags found for this track.");
        }
    } catch (err) {
        console.error("Error fetching tags:", err);
    }
}

fetchTags();
