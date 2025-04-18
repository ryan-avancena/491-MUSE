var socket = io.connect("http://localhost:5000");

socket.on('audio_data', function(data) {
    const glowText = document.getElementById('glow-text');
    const volume = data.volume;

    const normalized = Math.min(Math.max((volume + 50) / 50, 0), 1);
    const glowStrength = normalized * 8;
    const hue = 55;

    glowText.style.color = `hsl(${hue}, 100%, 70%)`;
    glowText.style.textShadow = `
        0 0 ${glowStrength}px hsl(${hue}, 100%, 70%),
        0 0 ${glowStrength * 0.5}px hsl(${hue}, 100%, 50%)`;
});
