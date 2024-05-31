let canvasManager = null;

function updateCanvasBarPopupEvents(appManager){
    canvasManager = appManager.canvasManager;
}


function setUpNodeDetailsMenuEvents () {
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

export { updateCanvasBarPopupEvents, setUpNodeDetailsMenuEvents, setUpAddShapeMenuEvents, setUpSelectDragMenuEvents}