const fs = require('fs');
const path = require('path')
const { search } = require('./tunebat'); 

const CSV_FILE = path.join(__dirname, "../data/songs_database.csv");

// Ensure the directory exists
const dataDir = path.dirname(CSV_FILE);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Function to write CSV data
function writeCSV(data, isFirstWrite = false) {
    const headers = [
        "Title", "Artist", "Album", "ReleaseDate","ID", "Key", "BPM", 
        "Acousticness", "Popularity", "Danceability", 
        "Instrumentalness", "Energy", "Speechiness", "Loudness", "Cover"
    ];
    
    const csvRows = data.map(result => [
        `"${result.n.replace(/"/g, '""')}"`,  // Title: Ensure proper quoting
        `"${JSON.stringify(result.as).replace(/"/g, '""')}"`,  // Fix: Properly escape double quotes
        `"${result.an.replace(/"/g, '""')}"`,  // Album: Properly escape quotes
        result.rd,
        result.id, 
        result.k, 
        result.b, 
        result.ac, 
        result.p, 
        result.da, 
        result.i, 
        result.e, 
        result.s, 
        result.lo,
        `"${result.ci && result.ci[0] ? result.ci[0].iu : ''}"`  // Only add value if available
    ].join(","));

    // If first write, include headers; otherwise, just append data
    const csvData = isFirstWrite 
        ? [headers.join(","), ...csvRows].join("\n") 
        : csvRows.join("\n");

    fs.appendFileSync(CSV_FILE, csvData + "\n", "utf8");
}

async function searchSong(query, isFirstWrite = false) {
    try {
        // Search using the query
        const results = await search(query);

        if (results.length > 0) {
            console.log(`Search Results for ${query}: ${results.length}`);

            // Convert results to a dictionary to remove duplicates (use ID as key)
            const uniqueResults = {};
            results.forEach(result => {
                if (!uniqueResults[result.id]) {
                    uniqueResults[result.id] = result;
                }
            });

            // Convert unique results back to an array
            const uniqueSongs = Object.values(uniqueResults);
            console.log(`Unique songs found for ${query}: ${uniqueSongs.length}`);

            // Write to CSV (only add headers if it's the first artist)
            writeCSV(uniqueSongs, isFirstWrite);
            
            console.log(`CSV updated with ${uniqueSongs.length} songs from ${query}`);

        } else {
            console.log(`No results found for ${query}.`);
        }
    } catch (error) {
        console.error(`Error searching for ${query}:`, error);
    }
}

// Search queries for multiple artists sequentially
async function searchAllArtists() {
    const RAP_ARTISTS = ["Drake", "Kendrick Lamar", "Future", "The Weeknd"];

    // Delete existing file to start fresh
    if (fs.existsSync(CSV_FILE)) {
        fs.unlinkSync(CSV_FILE);
    }

    for (let i = 0; i < RAP_ARTISTS.length; i++) {
        await searchSong(RAP_ARTISTS[i], i === 0);  // Add headers only for the first artist
    }
}

// Run the function
searchAllArtists();
