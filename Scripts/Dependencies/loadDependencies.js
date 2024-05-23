import { loadTippyJS } from './loadTippy.js';
import { loadAnimeJS } from './loadAnime.js';  

function loadDependencies() {
    // Load Tippy.js
    loadTippyJS();
    loadAnimeJS();
}



export { loadDependencies };