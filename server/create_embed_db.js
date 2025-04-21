/* create_db.js */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { search } from './tunebat.js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import pLimit from 'p-limit'; // npm install p-limit

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ENV for Last.fm key
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const LAST_FM_KEY = process.env.LAST_FM_API_KEY;
console.log(LAST_FM_KEY)

// Paths
const CSV_FILE = path.join(__dirname, "../data/songs_database.csv");
const CACHE_FILE = path.join(__dirname, "../data/songs_cache.json");
const likedTracksPath = path.join(__dirname, "../data/liked_tracks.json");
const TAGS_FILE = path.join(__dirname, "../data/track_tags.csv");

// Ensure output directories
const dataDir = path.dirname(CSV_FILE);
if (!fs.existsSync(dataDir)) {  
    fs.mkdirSync(dataDir, { recursive: true });
}

let cache = {};
if (fs.existsSync(CACHE_FILE)) {
    cache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
}

// Write CSV rows
function writeCSV(data, isFirstWrite = false) {
    const headers = [
        "Title", "Artist", "Album", "Camelot", "ReleaseDate", "ID", "Key", "BPM", 
        "Acousticness", "Popularity", "Happiness", "Danceability", 
        "Instrumentalness", "Energy", "Speechiness", "Loudness", "Cover"
    ];
    
    const csvRows = data.map(result => [
        `"${result.n.replace(/"/g, '""')}"`,
        `"${Array.isArray(result.as) ? result.as.join(', ') : result.as}"`,
        `"${result.an.replace(/"/g, '""')}"`,
        result.c,
        result.rd, result.id, result.k, result.b, result.ac, 
        result.p, result.h, result.da, result.i, result.e, 
        result.s, result.lo,
        `"${result.ci && result.ci[0] ? result.ci[0].iu : ''}"`
    ].join(","));

    const csvData = isFirstWrite ? [headers.join(","), ...csvRows] : csvRows;
    fs.writeFileSync(CSV_FILE, csvData.join("\n") + "\n", { encoding: "utf8", flag: isFirstWrite ? "w" : "a" });
}

// Cleaners
function cleanTitle(title) {
    return title
        .replace(/\(.*?\)/g, '')
        .replace(/\[.*?\]/g, '')
        .replace(/feat\..*/i, '')
        .replace(/ft\..*/i, '')
        .replace(/,/g, '')  // remove commas
        .trim();
}

function cleanArtist(artist) {
    return artist.replace(/,/g, '').trim();
}

// Song searcher
async function searchSong(query, isFirstWrite = false) {
    try {
        if (cache[query]) {
            console.log(`Using cached data for ${query}`);
            writeCSV(cache[query].slice(0, 3), isFirstWrite);
            return;
        }

        const results = await search(query);

        if (results.length > 0) {
            console.log(`Search Results for ${query}: ${results.length}`);

            const uniqueResults = {};
            results.forEach(result => {
                if (!uniqueResults[result.id]) {
                    uniqueResults[result.id] = result;
                }
            });

            const uniqueSongs = Object.values(uniqueResults).slice(0, 3);
            cache[query] = uniqueSongs;
            fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));

            writeCSV(uniqueSongs, isFirstWrite);
        } else {
            console.log(`No results found for ${query}.`);
        }
    } catch (error) {
        console.error(`Error searching for ${query}:`, error);
    }
}

// Last.fm tag fetcher
const fetchTags = async (artist, track) => {
    try {
        const url = `https://ws.audioscrobbler.com/2.0/?method=track.getTopTags&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}&api_key=${LAST_FM_KEY}&format=json`;

        const response = await fetch(url);
        if (!response.ok) throw new Error(`API error: ${response.statusText}`);

        const result = await response.json();
        const tags = result.toptags?.tag?.slice(0, 5).map(tag => tag.name).join(", ") || "No tags";
        return tags;
    } catch (error) {
        console.error(`Error fetching tags for ${artist} - ${track}:`, error);
        return "Error fetching tags";
    }
};

const fetchArtistTags = async (artist) => {
    try {
        const url = `https://ws.audioscrobbler.com/2.0/?method=artist.gettoptags&artist=${encodeURIComponent(artist)}&api_key=${LAST_FM_KEY}&format=json`;
        // const urk = `https://ws.audioscrobbler.com/2.0/?method=artist.gettoptags&artist=${ARTIST}&api_key=${LAST_FM_KEY}&format=json`;

        const response = await fetch(url);
        if (!response.ok) throw new Error(`API error: ${response.statusText}`);

        const result = await response.json();
        const tags = result.toptags?.tag?.slice(0, 5).map(tag => tag.name).join(", ") || "No tags";
        return tags;
    } catch (error) {
        console.error(`Error fetching tags for ${artist}`, error);
        return "Error fetching tags";
    }
}

// Tag processor
async function embedTagsFromCache() {
    if (!fs.existsSync(CACHE_FILE)) {
        console.error("songs_cache.json not found. Run the main song search first.");
        return;
    }

    const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    const limit = pLimit(5); // concurrency limit
    const promises = [];

    console.log(LAST_FM_KEY)

    for (const key in cache) {
        if (!Array.isArray(cache[key])) continue;

        for (const song of cache[key]) {
            if (!song.n || !song.as) continue;
            const id = song.id;
            const artist = song.as[0];
            const track = song.n.replace(/\(.*?\)|\[.*?\]/g, "").trim();

            promises.push(limit(async () => {
                const tags = await fetchTags(artist, track);
                if (tags === "No tags") {
                    tags = await fetchArtistTags(artist);
                    console.log(tags)
                }
                return `"${id}","${artist}","${track}","${tags.replace(/"/g, '""')}"`;
            }));
        }
    }

    const results = await Promise.allSettled(promises);
    const csvRows = results
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value);

    fs.writeFileSync(TAGS_FILE, "ID,Artist,Track,Tags\n" + csvRows.join("\n"));
    console.log("✅ Tags CSV saved:", TAGS_FILE);
}

// Main controller
async function searchLikedTracksAndEmbed() {
    if (!fs.existsSync(likedTracksPath)) {
        console.error("liked_tracks.json not found. Please run the Python scraper first.");
        return;
    }

    if (fs.existsSync(CSV_FILE)) {
        fs.unlinkSync(CSV_FILE);
    }

    const likedTracks = JSON.parse(fs.readFileSync(likedTracksPath, "utf-8"));
    const limit = pLimit(5); // Tune as needed

    const promises = likedTracks.map((track, i) => {
        const query = `"${cleanTitle(track.title)}" ${cleanArtist(track.artist)}`;
        return limit(() => searchSong(query, i === 0));
    });

    await Promise.allSettled(promises);

    console.log("✅ Finished searching all liked tracks.");
    await embedTagsFromCache();
}

searchLikedTracksAndEmbed();
