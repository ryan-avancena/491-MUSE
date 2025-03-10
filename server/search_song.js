/* search_song.js

- main query function to search for a song
- returns top 5 results from api

*/

import { search } from './tunebat.js';  

async function searchSong(query) {
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
searchSong(query);


// async function searchSong(query) {
//     try {
//         const results = await search(query);
        
//         if (results.length > 0) {
//             console.log("Search Results (5):");
//             const first5 = results.slice(0, 5);  // customizable slice
            
//             first5.forEach(result => {
//                 console.log(`Title: ${result.n}`);
//                 console.log(`Artist: ${result.as.join(", ")}`);
//                 console.log(`Album: ${result.an}`);
//                 console.log(`ID: ${result.id}`);
//                 console.log(`Key: ${result.k}`); 
//                 console.log(`BPM: ${result.b}`);
//                 console.log(`Acousticness: ${result.ac}`);
//                 console.log(`Popularity: ${result.p}`);
//                 console.log(`Danceability: ${result.da}`);
//                 console.log(`Instrumentalness: ${result.i}`);
//                 console.log(`Energy: ${result.e}`);
//                 console.log(`Speechiness: ${result.s}`);
//                 console.log(`Loudness dB: ${result.lo}`);
//                 console.log(`rd: ${result.rd}`);
//                 console.log(`covers: ${JSON.stringify(result.ci)}`);
//                 console.log('----------------------------------');
//             });
//         } else {
//             console.log('No results found.');
//         }
//     } catch (error) {
//         console.error('Error searching for the song:', error);
//     }
// }

// const query = "feel no ways - drake";  
// await searchSong(query);  
