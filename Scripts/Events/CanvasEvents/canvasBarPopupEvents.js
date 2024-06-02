import { closeAllPopups } from "../../UI/canvasUI.js";

let canvasManager = null;

function updateCanvasBarPopupEvents(appManager){
    canvasManager = appManager.canvasManager;
}


function setUpNodeDetailsMenuEvents () {
}

function setUpHistoryMenuEvents() {
    const clearButton = document.getElementById("history-menu-clear-button");
    clearButton.addEventListener('click', () => {
        canvasManager.history.length = 0;
        canvasManager.poppedHistory.length = 0;
        for (let i = 0; i < canvasManager.nodes.length; i++) {
            const node = canvasManager.nodes[i];
            node.positionHistory.splice(node.currentPositionIndex + 1);
        }
        let lowerLeftPopup = document.getElementById('lower-left-popup');
        lowerLeftPopup.innerHTML = "";
        lowerLeftPopup.style.display = "none";
        if(canvasManager.toggleHistoryMenu) {
            canvasManager.toggleHistoryMenu = false;
            document.getElementById("history-button").classList.remove('button-active');
        }
    });
    
}

function setUpAddShapeMenuEvents() {
    
}

function setUpSelectDragMenuEvents () {
    const selectButton = document.getElementById("select-canvas-button");
    const dragButton = document.getElementById("drag-canvas-button");
    selectButton.addEventListener('click', () => {
        canvasManager.setCanvasManagerInteractionMode("selectCanvas");
        
    });
    dragButton.addEventListener('click', () => {
        canvasManager.setCanvasManagerInteractionMode("dragCanvas");
    });
}

export { updateCanvasBarPopupEvents, setUpHistoryMenuEvents, setUpNodeDetailsMenuEvents, setUpAddShapeMenuEvents, setUpSelectDragMenuEvents}