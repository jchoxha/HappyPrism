import { addNode, removeNode } from './Classes/nodeClass.js';
import { CanvasManager } from './Classes/canvasManagerClass.js';
import { setupEventListeners } from './Events/eventManager.js'
import { physicsUpdate } from './Physics/physics.js'
import { Theme } from './Misc/theme.js'


document.addEventListener('DOMContentLoaded', () => {
    const theme = new Theme();
    theme.initTheme();
    const canvasManager = new CanvasManager('canvas');
    canvasManager.initCanvas(theme);
    setupEventListeners(canvasManager);

    function update() {
        canvasManager.currentTime = Date.now();
        physicsUpdate(canvasManager);
        canvasManager.draw();
    }
    function animate() {
        update();
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
});


