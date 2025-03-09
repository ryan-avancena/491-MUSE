/* search_song.js

- this is the main file that's going to be used for the searching function in my application
- it uses the tunebat api to search for songs and their features
- the features are then displayed in the console

*/

const { search } = require('./tunebat'); 

async function searchSong(query) {
    try {
        
        const results = await search(query);
        
        if (results.length > 0) {
            console.log("Search Results (5):");
            const first5 = results.slice(0, 5);       // this should be customizable 
            
            first5.forEach(result => {
                console.log(`Title: ${result.n}`);
                console.log(`Artist: ${result.as.join(", ")}`);
                console.log(`Album: ${result.an}`);
                console.log(`ID: ${result.id}`);
                console.log(`Key: ${result.k}`); 
                console.log(`BPM: ${result.b}`);
                console.log(`Acousticness : ${result.ac}`)
                console.log(`Popularity: ${result.p}`)
                console.log(`Danceability: ${result.da}`);
                console.log(`Instrumentalness: ${result.i}`);
                console.log(`Energy: ${result.e}`);
                console.log(`Speechiness: ${result.s}`);
                console.log(`Loudness dB: ${result.lo}`);
                // console.log(`cr: ${result.cr}`)
                // console.log(`l: ${result.l}`)
                console.log(`rd: ${result.rd}`)
                // console.log(`is: ${result.is}`)
                // console.log(`ie: ${result.ie}`)
                // console.log(`er: ${result.er}`)
                console.log(`covers: ${JSON.stringify(result.ci)}`)
                console.log('----------------------------------');
            });
        } else {
            console.log('No results found.');
        }
    } catch (error) {
        console.error('Error searching for the song:', error);
    }
}

const query = "drake";
r = searchSong(query);