import nid from 'node-id3';
import simi from 'string-similarity';
import path from 'path';

const TuneBatVersion = 1;
const TunebatScoreThreshold = 0.8;
const base = "https://api.tunebat.com/api/tracks/search";
const param = "term";

let throttleProm = null;

// Testing indicates that you can execute 15 rapid queries before being told to wait a minute.
export async function search(query) {
    query = encodeURI(query);
    let url = `${base}?${param}=${query}`;
    // console.log(`Fetching data from: ${url}`);
    
    let r = (await fetch(url));
    let t = await r.text();
    try {
        return JSON.parse(t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/’/g, "'")).data.items;
    } catch(e) {
        if(r.headers.get("retry-after") !== null) {
            let count = parseInt(r.headers.get("retry-after")) + 5;
            if(throttleProm === null) {
                throttleProm = new Promise(
                    (resolve) => {
                        setTimeout(resolve, count * 1000)
                        let interval;
                        interval = setInterval(() => {
                            process.stdout.write(`\x1b[1B\x1b[2K\x1b[0GThrottled. Waiting ${count--} seconds...\x1b[1A`)
                            if(count === 0) clearInterval(interval);
                        }, 990);
                    })
                    .then(() => process.stdout.write(`\x1b[1B\x1b[2K\x1b[1A`));
                throttleProm.then(() => throttleProm = null);
            }
            return await throttleProm.then(() => search(query));
        }
        throw e;
    }
}

export async function getID3Tags(file) {
    return await nid.read(file);
}

export async function updateID3Tags(file, tags) {
    return await nid.update(tags, file);
}

export async function shouldBeTunebatted(file) {
    let tags = await getID3Tags(file);
    if(tags.userDefinedText === undefined) return true;

    let tbV = tags.userDefinedText.find((el) => el.description === "Tunebat Version");
    if(tbV === undefined) return true;
    if(parseInt(tbV.value) <= TuneBatVersion) return false; // lte because we want the default to be true
    return true;
}

export async function tunebat(file, match = null) {
    let tags = await getID3Tags(file);
    let bestMatch = {el: null, score: 0};
    let results;

    if(!tags.artist || !tags.title) {
        let parts = path.basename(file, ".mp3").split(" - ");
        if(parts.length !== 2) throw new TuneBatError(`Couldn't collect artist and title from filename. Make sure it's "Artist - Title". Found "${parts.join(" - ")}"`, file, null, null, null);
        tags.artist = parts[0];
        tags.title = parts[1];
    }

    if(match === null) {
        if(tags.artist) tags.artist = tags.artist?.split(",")[0] ?? "";

        let query = `${tags.artist} ${tags.title}`;
        results = await search(query);

        // Find the best match. If the title is empty, then there's no way of knowing for sure, and manual labour is required.
        if((tags.title ?? "") !== "") {
            bestMatch = results.reduce((best, curr) => {
                if(tags.artist === "" || curr.as.find((a) => a.toLowerCase() === tags.artist.toLowerCase())) {
                    let score = simi.compareTwoStrings(curr.n, tags.title);
                    if(score > best.score) {
                        return {el: curr, score: score};
                    }
                }
                return best;
            }, bestMatch);
        }
    }

    if(match !== null || (bestMatch.el !== null && bestMatch.score >= TunebatScoreThreshold)) {
        bestMatch = match !== null ? match : bestMatch.el;

        tags = {
            ...tags,
            album: bestMatch.an,
            artist: bestMatch.as[0],
            initialKey: bestMatch.c,
            userDefinedText: [
                {description: "Tunebat Version", value: `${TuneBatVersion}`},
                {description: "Spotify ID", value: `${bestMatch.id}`},
                {description: "Acousticness", value: `${bestMatch.ac}`},
                {description: "Danceability", value: `${bestMatch.da}`},
                {description: "Energy", value: `${bestMatch.e}`},
                {description: "Happiness", value: `${bestMatch.h}`},
                {description: "Instrumentalness", value: `${bestMatch.i}`},
                {description: "Liveness", value: `${bestMatch.li}`},
                {description: "Loudness", value: `${bestMatch.lo}`},
                {description: "Speechiness", value: `${bestMatch.s}`}
            ]
        };
        if(await updateID3Tags(file, tags)) return true;
        else throw new TuneBatError("Something bad happened?", file, tags.title, tags.artist, bestMatch.score);
    } else {
        return {
            file,
            artist: tags.artist,
            title: tags.title,
            results,
            bestMatch
        };
    }
}

class TuneBatError extends Error {
    constructor(message, file, title, artist, score) {
        super(message);
        this.name = "TuneBatError";
        this.file = file;
        this.title = title;
        this.artist = artist;
        this.score = score;
    }
}
