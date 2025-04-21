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

    result.slice(0, 4).forEach(song => {
        const songDiv = document.createElement('div');
        songDiv.classList.add('songDiv');
        songDiv.innerHTML = `
            <img src="${song.ci[0].iu}" alt="Thumbnail" width="150">
            <h3>${song.n}</h3>
            <h4>${song.as.join(', ')}</h4>
            <h5>BPM:</strong> ${song.b} | <strong>Key:</strong> ${song.k} | <strong>Camelot:</strong> ${song.c}</h5>
            <hr>
            <p>Popularity: ${song.p}</p>
            <p>Energy: ${song.e}</p>
            <p>Danceability: ${song.da}</p>
            <p>Happiness: ${song.h}</p>
            <p>Instrumentalness: ${song.i}</p>
            <p>Speechiness: ${song.s}</p>
        `;
        resultDiv.appendChild(songDiv);
    });
}
