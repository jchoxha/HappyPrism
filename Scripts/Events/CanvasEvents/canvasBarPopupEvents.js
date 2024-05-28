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
    const selectOrDragButton = document.getElementById("select-or-drag-button");
    const selectOrDragImg = selectOrDragButton.querySelector('img');
    console.log(selectOrDragImg.src);

    selectButton.addEventListener('click', () => {
        canvasManager.setCanvasManagerInteractionMode("selectCanvas");
        selectOrDragImg.src = "Assets/Images/Icons/ui/Canvas/Lower/Popups/SelectDrag/select.svg";
            dragButton.classList.remove('button-active');
            selectButton.classList.add('button-active');
    });
    dragButton.addEventListener('click', () => {
        canvasManager.setCanvasManagerInteractionMode("dragCanvas");
        selectOrDragImg.src = "Assets/Images/Icons/ui/Canvas/Lower/Popups/SelectDrag/drag.svg";
        selectButton.classList.remove('button-active');
        dragButton.classList.add('button-active');

    });
}

export { updateCanvasBarPopupEvents, setUpNodeDetailsMenuEvents, setUpAddShapeMenuEvents, setUpSelectDragMenuEvents}