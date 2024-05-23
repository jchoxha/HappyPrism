import { Logger } from "../Debug/logger.js";

function loadAnimeJS() {
    // Load Anime.js
    const animeScript = document.createElement('script');
    animeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js';
    animeScript.async = false;
    animeScript.onload = initializeAnime;
    document.head.appendChild(animeScript);
}

// Initialize Anime.js animations
function initializeAnime() {
    Logger.log('Anime.js loaded successfully');
    
    // Example initialization of an animation (customize as needed)
    const homeButton = document.getElementById('home-button');
    const happyText = document.getElementById('happy-text');
    const letters = document.querySelectorAll('.letter');

    const animateLetters = () => {
        anime({
            targets: letters,
            color: [
                { value: '#FF0000' }, // Red
                { value: '#FF7F00' }, // Orange
                { value: '#FFFF00' }, // Yellow
                { value: '#00FF00' }, // Green
                { value: '#0000FF' }, // Blue
                { value: '#4B0082' }, // Indigo
                { value: '#9400D3' }  // Violet
            ],
            easing: 'linear',
            duration: 2000,
            loop: true,
            delay: anime.stagger(100, { start: 0, direction: 'normal' })
        });
    };

    homeButton.addEventListener('mouseover', () => {
        animateLetters();
    });

    homeButton.addEventListener('mouseout', () => {
        anime.remove(letters);
    });
}

export { loadAnimeJS };
