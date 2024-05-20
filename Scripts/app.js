import { CanvasManager } from './Classes/Canvas/canvasManagerClass.js';
import { setupEventListeners } from './Events/eventManager.js'
import { physicsUpdate } from './Physics/physics.js'
import { Theme } from './Misc/theme.js'
import { loadUI, updateUI } from './UI/ui.js'
import { Logger } from './Debug/logger.js'


document.addEventListener('DOMContentLoaded', () => {
    const debugMode = false; // Set to false to turn off logging
    Logger.setDebugMode(debugMode);

    loadUI("default");

    const theme = new Theme();
    theme.initTheme();

    const canvasManager = new CanvasManager('canvas');
    canvasManager.initCanvas(theme);

    setupEventListeners(canvasManager);

    function update() {
        canvasManager.update();
        if (canvasManager.physicsEnabled) {
            physicsUpdate(canvasManager);
        }
        updateUI(canvasManager);
    }
    function animate() {
        update();
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
});


