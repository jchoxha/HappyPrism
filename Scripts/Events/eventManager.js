// eventManager.js

import { setUpCanvasEvents, updateCanvasEvents } from "./CanvasEvents/canvasEvents.js";


function setupEventListeners(appManager) {
    setUpCanvasEvents(appManager);
}

function updateEventListeners(appManager) {
    updateCanvasEvents(appManager);
}

export { setupEventListeners, updateEventListeners };
