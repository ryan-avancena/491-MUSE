async function getRecommendations() {
    console.log(songId);

    if (!songId) {
        alert("Please select a song!");
        return;
    }

    const response = await fetch(`/recommend?song_id=${songId}&top_k=5`);
    const data = await response.json();

    let recommendationsDiv = document.getElementById("recommendations");
    recommendationsDiv.innerHTML = "<h3>Recommended Tracks</h3>";

    if (data.error) {
        recommendationsDiv.innerHTML += `<p style="color: red;">${data.error}</p>`;
        return;
    }

    let table = `<table id="recommendationsTable" class="display">
        <thead>
            <tr>
                <th>Title</th>
                <th>Artist</th>
                <th>Album</th>
                <th>Key</th>
                <th>BPM</th>
                <th>Distance</th>
            </tr>
        </thead>
        <tbody>`;

    data.forEach(track => {
        table += `<tr>
            <td>${track.Title}</td>
            <td>${track.Artist}</td>
            <td>${track.Album}</td>
            <td>${track.Key}</td>
            <td>${track.BPM}</td>
            <td>${track.Distance.toFixed(2)}</td>
        </tr>`;
    });

    table += `</tbody></table>`;
    recommendationsDiv.innerHTML += table;

    $('#recommendationsTable').DataTable();
}
