/* create_db.js



*/

const fs = require('fs');
const path = require('path');
const { search } = require('./tunebat');

const CSV_FILE = path.join(__dirname, "../data/songs_database.csv");
const CACHE_FILE = path.join(__dirname, "../data/songs_cache.json");

const dataDir = path.dirname(CSV_FILE);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

let cache = {};
if (fs.existsSync(CACHE_FILE)) {
    cache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
}

function writeCSV(data, isFirstWrite = false) {
    const headers = [
        "Title", "Artist", "Album", "ReleaseDate", "ID", "Key", "BPM", 
        "Acousticness", "Popularity", "Happiness", "Danceability", 
        "Instrumentalness", "Energy", "Speechiness", "Loudness", "Cover"
    ];
    
    const csvRows = data.map(result => [
        `"${result.n.replace(/"/g, '""')}"`,
        `"${Array.isArray(result.as) ? result.as.join(', ') : result.as}"`, // Flatten artist array
        `"${result.an.replace(/"/g, '""')}"`,
        result.rd, result.id, result.k, result.b, result.ac, 
        result.p, result.h, result.da, result.i, result.e, 
        result.s, result.lo,
        `"${result.ci && result.ci[0] ? result.ci[0].iu : ''}"`
    ].join(","));

    const csvData = isFirstWrite ? [headers.join(","), ...csvRows] : csvRows;
    fs.writeFileSync(CSV_FILE, csvData.join("\n") + "\n", { encoding: "utf8", flag: isFirstWrite ? "w" : "a" });
}

async function searchSong(query, isFirstWrite = false) {
    try {
        if (cache[query]) {
            console.log(`Using cached data for ${query}`);
            writeCSV(cache[query], isFirstWrite);
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

            const uniqueSongs = Object.values(uniqueResults);
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

async function searchAllArtists() {
    const RAP_ARTISTS = ["Drake", "Kendrick Lamar", "Future", "Tupac", "50 Cent"];
    const EDM_ARTISTS = ["John Summit, Aviicii", "David Guetta", "Calvin Harris", "Martin Garrix", "Zedd", "knock2"];

    if (fs.existsSync(CSV_FILE)) {
        fs.unlinkSync(CSV_FILE);
    }

    await Promise.all(RAP_ARTISTS.map((artist, index) => searchSong(artist, index === 0)));
    console.log("All artist searches completed.");
}

searchAllArtists();