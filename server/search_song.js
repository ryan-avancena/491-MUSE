// search_song.js
import { search } from './tunebat.js';

async function searchSong(query) {
    try {
        const results = await search(query);
        const top5Results = results.slice(0, 4);
        process.stdout.write(JSON.stringify(top5Results));
    } catch (error) {
        process.stderr.write(JSON.stringify({ error: 'Error searching', details: error.message }));
        process.exit(1);
    }
}

const query = process.argv[2];

if (!query) {
    process.stderr.write(JSON.stringify({ error: 'No query provided' }));
    process.exit(1);
}

searchSong(query);
