function createStar() {
    const star = document.createElement('div');
    star.classList.add('star');
    
    // Random position and animation duration
    star.style.left = Math.random() * 100 + 'vw';
    star.style.top = '100vh';
    star.style.animationDuration = (Math.random() * 5 + 5) + 's'; // 5-10s float time
    star.style.opacity = Math.random();

    document.body.appendChild(star);

    // Remove the star after it floats out of view
    setTimeout(() => {
        star.remove();
    }, 10000);
}

setInterval(createStar, 100);