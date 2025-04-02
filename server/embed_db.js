/* embed_db.js

- this script uses the last.fm api, to find the top "tags" for a given artist and track
- the tags are used to categorize the music, and can be used to find similar songs
- this could be used for future embeddings or seeing how the tags correlate with the other features

*/

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import csvParser from 'csv-parser';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const LAST_FM_KEY = process.env.LAST_FM_API_KEY;
const jsonFilePath = path.join(__dirname, '../data/songs_cache.json'); // JSON input
const csvFilePath = path.join(__dirname, '../data/track_tags.csv'); // CSV output

const readFileAsync = promisify(fs.readFile);

/*

fetchTags()
- Input: artist (string), track (string)
- Output: tags (string)

*/

const fetchTags = async (artist, track) => {
    try {
        const url = `https://ws.audioscrobbler.com/2.0/?method=track.gettoptags&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}&api_key=${LAST_FM_KEY}&format=json`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`API error: ${response.statusText}`);

        const result = await response.json();
        
        const tags = result.toptags?.tag?.slice(0,5).map(tag => tag.name).join(", ") || "No tags";
        return tags;
    } catch (error) {
        console.error(`Error fetching tags for ${artist} - ${track}:`, error);
        return "Error fetching tags";
    }
};

/*

processSongs()
- Input: none
- Output: none

Fetches tags for the songs, and saves the results to a CSV file (../data/track_tags.csv)

*/

const processSongs = async () => {
    try {
        const data = await readFileAsync(jsonFilePath, 'utf8');
        let cache = JSON.parse(data);
        let csvRows = [];
        // let count = 0;  // Counter to limit to 5 songs

        for (const key in cache) {
            if (!Array.isArray(cache[key])) continue;

            for (const song of cache[key]) {
                if (!song.n || !song.as) continue;

                const id = song.id;
                const artist = song.as[0];  //  first artist
                let track = song.n.replace(/\(.*?\)|\[.*?\]/g, "").trim(); // Clean track name

                console.log(`Fetching tags for: ${artist} - ${track}`);

                const tags = await fetchTags(artist, track);

                csvRows.push(`${id},${artist},"${track}","${tags}"`);
            }
        }

        fs.writeFileSync(csvFilePath, "ID,Artist,Track,Tags\n" + csvRows.join("\n"));
        console.log("CSV file saved:", csvFilePath);

    } catch (error) {
        console.error("Error processing songs:", error);
    }
};

processSongs();
