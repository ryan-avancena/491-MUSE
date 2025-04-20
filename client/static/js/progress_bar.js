const form = document.getElementById("soundcloud-form");
const progressContainer = document.getElementById("progress-container");
const progressBar = document.getElementById("progress-bar");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("soundcloud_username").value;

    progressContainer.style.display = "block";
    progressBar.style.width = "10%"; // Just visual feedback

    try {
    const res = await fetch("/submit-soundcloud", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `soundcloud_username=${encodeURIComponent(username)}`
    });

    progressBar.style.width = "70%";

    const data = await res.text(); // assuming plain text response

    if (res.ok && data === "done") {
        progressBar.style.width = "100%";
        setTimeout(() => {
        window.location.href = "/dj";
        }, 500);
    } else {
        alert("There was an error processing your request.");
        progressContainer.style.display = "none";
    }
    } catch (err) {
        console.error(err);
        alert("An error occurred.");
        progressContainer.style.display = "none";
    }
});