// eventManager.js

import { setUpCanvasEvents } from "./CanvasEvents/canvasEvents.js";


function setupEventListeners(appManager) {
    setUpCanvasEvents(appManager.canvasManager);
}

export { setupEventListeners };
