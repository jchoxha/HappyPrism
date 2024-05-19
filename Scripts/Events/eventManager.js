// eventManager.js

import { setUpUiEvents } from "./uiEvents.js";
import { setUpUserEvents } from "./userEvents.js";


function setupEventListeners(canvasManager) {
    setUpUiEvents(canvasManager);
    setUpUserEvents(canvasManager);
}

export { setupEventListeners };
