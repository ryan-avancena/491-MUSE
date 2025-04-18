document.getElementById('data-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const query = document.getElementById('data').value;

    fetch(`/search?query=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = '';

            if (data.error) {
                resultDiv.innerHTML = `<p>Error: ${data.error}</p>`;
            } else {
                displayResult(data);
            }
        })
        .catch(error => {
            console.error('Search error:', error);
            document.getElementById('result').innerHTML = `<p>Error: ${error}</p>`;
        });
});

function displayResult(result) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';

    result.slice(0, 5).forEach(song => {
        const songDiv = document.createElement('div');
        songDiv.classList.add('songDiv');
        songDiv.innerHTML = `
            <h3>${song.n}</h3>
            <p><strong>Artist(s):</strong> ${song.as.join(', ')}</p>
            <p><strong>Album:</strong> ${song.an}</p>
            <p><strong>Duration:</strong> ${(song.d / 1000).toFixed(2)} seconds</p>
            <img src="${song.ci[0].iu}" alt="Thumbnail" width="150">
            <h4>DJ Metrics:</h4>
            <ul>
                <p><strong>BPM:</strong> ${song.b} | <strong>Key:</strong> ${song.k} | <strong>Camelot:</strong> ${song.c}</p>
                <p><strong>Duration:</strong> ${song.d} | <strong>Release Date:</strong> ${song.rd}</p>
                <li><strong>Popularity:</strong> ${song.p}</li>
                <li><strong>Energy:</strong> ${song.e}</li>
                <li><strong>Danceability:</strong> ${song.da}</li>
                <li><strong>Happiness:</strong> ${song.h}</li>
                <li><strong>Instrumentalness:</strong> ${song.i}</li>
                <li><strong>Liveness:</strong> ${song.li}</li>
                <li><strong>Loudness:</strong> ${song.lo}</li>
                <li><strong>Speechiness:</strong> ${song.s}</li>
            </ul>
        `;
        resultDiv.appendChild(songDiv);
    });
}
