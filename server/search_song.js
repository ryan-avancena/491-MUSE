const { search } = require('./tunebat'); // Assuming tunebat.js is the file with the code

async function searchSong(query) {
    try {
        // Search using the query
        const results = await search(query);
        
        if (results.length > 0) {
            console.log("Search Results (5):");
            const first5 = results.slice(0, 5);
            
            first5.forEach(result => {
                console.log(`Title: ${result.n}`);
                console.log(`Artist: ${result.as.join(", ")}`);
                console.log(`Album: ${result.an}`);
                console.log(`ID: ${result.id}`);
                console.log(`Key: ${result.k}`); // Corrected from `key` to `c`
                console.log(`BPM: ${result.b}`);
                console.log(`Popularity: ${result.p}`)
                console.log(`Danceability: ${result.da}`);
                console.log(`Instrumentalness: ${result.i}`);
                console.log(`Energy: ${result.e}`);
                console.log('----------------------------------');
            });
        } else {
            console.log('No results found.');
        }
    } catch (error) {
        console.error('Error searching for the song:', error);
    }
}

// Example search query
const query = "die with a smile - bruno mars";
r = searchSong(query);
// console.log(r)u
