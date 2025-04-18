/* search_song.js

- main query function to search for a song
- returns top 5 results from api

*/

import { search } from './tunebat.js';  

async function searchSong(query) {
    console.log(query)
    try {
        const results = await search(query);

        if (results.length > 0) {
            const top5Results = results.slice(0, 5);
            console.log(JSON.stringify(top5Results));  
        } else {
            console.log(JSON.stringify([]));  
        }
    } catch (error) {
        console.error(error);  
        console.log(JSON.stringify({ error: 'Error searching for the song', details: error.message })); 
    }
}

const query = process.argv[2];  

console.log(JSON.stringify(results));

// searchSong(query);