import { Logger } from "../Debug/logger.js";
import { setUpHistoryMenuEvents, setUpNodeDetailsMenuEvents, setUpAddShapeMenuEvents, setUpSelectDragMenuEvents } from "../Events/CanvasEvents/canvasBarPopupEvents.js";
import { formatHistoryTimeStamp, callFunctionEveryMinuteOnTheMinute} from '../Misc/utils.js';

let canvasManager = null;

function updateCanvasUI(appManager){
    canvasManager = appManager.canvasManager;
    updateHistoryUI();

    //Update Canvas UI details

}

function closeAllPopups(){

    if(canvasManager.popUpOpen){
        //Lower Left Popup
        // let lowerLeftPopup = document.getElementById('lower-left-popup');
        // lowerLeftPopup.innerHTML = "";
        // lowerLeftPopup.style.display = "none";
        // if(canvasManager.toggleHistoryMenu) {
        //     canvasManager.toggleHistoryMenu = false;
        //     document.getElementById("history-button").classList.remove('button-active');
        // }
        //Lower Center Popup
        let lowerCenterPopup = document.getElementById('lower-center-popup');
        lowerCenterPopup.innerHTML = "";
        if(canvasManager.toggleAddShapeMenu) canvasManager.toggleAddShapeMenu = false;
        if(canvasManager.toggleSelectOrDragMenu) canvasManager.toggleSelectOrDragMenu = false;


        canvasManager.popUpOpen = false;
    }
    

    
}

function toggleNodeDetailsMenu(node){
    let lowerCenterPopup = document.getElementById('lower-center-popup');
    if(node.type == "shape"){
        canvasManager.popUpOpen = true;

        
        let lowerCenter = document.getElementById('lower-center');
        // Calculate the center point of the addShapeButton
        var rect = lowerCenter.getBoundingClientRect();
        var centerX = rect.left + (rect.width / 2);
        // Convert centerX to string and append 'px', assign as left of popup
        lowerCenterPopup.style.left = centerX + 'px';
        lowerCenterPopup.innerHTML = `
        <button id="shape-fill-button"><img src="Assets/Images/Icons/ui/Canvas/Lower/Popups/NodeDetails/circle.svg" alt="Fill color"></button>
        `;
        setUpNodeDetailsMenuEvents();
    }
}

function toggleAddShapeMenu(){
    canvasManager.setCanvasManagerInteractionMode("addShape");
    canvasManager.toggleAddShapeMenu = !canvasManager.toggleAddShapeMenu;

    let lowerCenterPopup = document.getElementById('lower-center-popup');

    if (canvasManager.toggleAddShapeMenu) {

        canvasManager.popUpOpen = true;

        
        let addShapeButton = document.getElementById('add-shape-button');
        // Calculate the center point of the addShapeButton
        var rect = addShapeButton.getBoundingClientRect();
        var centerX = rect.left + (rect.width / 2);
        // Convert centerX to string and append 'px', assign as left of popup
        lowerCenterPopup.style.left = centerX + 'px';
        lowerCenterPopup.innerHTML = `
        <button id="elipse-shape-button"><img src="Assets/Images/Icons/ui/Canvas/Lower/Popups/AddShape/elipse.svg" alt="Elipse"></button>
        <button id="rounded-rectangle-shape-button"><img src="Assets/Images/Icons/ui/Canvas/Lower/Popups/AddShape/rounded-rectangle.svg" alt="Rounded Rectangle"></button>
        `;
        setUpAddShapeMenuEvents();
    } else {
        lowerCenterPopup.innerHTML = "";
    }
}

function toggleSelectOrDragMenu(){
    //Set interaction mode based on whether we were last selecting or dragging
    canvasManager.setCanvasManagerInteractionMode(canvasManager.lastIM1OrIM2);
    canvasManager.toggleSelectOrDragMenu = !canvasManager.toggleSelectOrDragMenu;

    let lowerCenterPopup = document.getElementById('lower-center-popup');
    

    if (canvasManager.toggleSelectOrDragMenu) {

        canvasManager.popUpOpen = true;

        let addShapeButton = document.getElementById('select-or-drag-button');
        // Calculate the center point of the addShapeButton
        var rect = addShapeButton.getBoundingClientRect();
        var centerX = rect.left + (rect.width / 2);
        // Convert centerX to string and append 'px', assign as left of popup
        lowerCenterPopup.style.left = centerX + 'px';
        lowerCenterPopup.innerHTML = `
        <button id="select-canvas-button"><img src="Assets/Images/Icons/ui/Canvas/Lower/Popups/SelectDrag/select.svg" alt="Select"></button>
        <button id="drag-canvas-button"><img src="Assets/Images/Icons/ui/Canvas/Lower/Popups/SelectDrag/drag.svg" alt="Drag"></button>
        `;
        if(canvasManager.interactionMode == "selectCanvas"){
            document.getElementById("drag-canvas-button").classList.remove('button-active');
            document.getElementById("select-canvas-button").classList.add('button-active');
        }
        else if(canvasManager.interactionMode == "dragCanvas"){
            document.getElementById("select-canvas-button").classList.remove('button-active');
            document.getElementById("drag-canvas-button").classList.add('button-active');
        }

        setUpSelectDragMenuEvents();
    } else {
        lowerCenterPopup.innerHTML = "";
    }
}

function toggleHistoryMenu(){
    canvasManager.toggleHistoryMenu = !canvasManager.toggleHistoryMenu;
    console.log(canvasManager.toggleHistoryMenu);
    const lowerLeftPopup = document.getElementById('lower-left-popup');
    if(canvasManager.toggleHistoryMenu){
        lowerLeftPopup.style.display = "flex";
        document.getElementById("history-button").classList.add('button-active');
        updateHistoryMenuUI();
    } else {
        document.getElementById("history-button").classList.remove('button-active');
        lowerLeftPopup.style.display = "none";
        lowerLeftPopup.innerHTML = "";
    }
}

function updateHistoryUI(){
    updateUndoRedoUI();
    if(canvasManager.toggleHistoryMenu){
        callFunctionEveryMinuteOnTheMinute(updateHistoryMenuUI);
    }
    
}

function updateHistoryMenuUI(){
    if(!canvasManager.history.length == 0){
    
    let lowerLeftPopup = document.getElementById('lower-left-popup');
    lowerLeftPopup.style.display = "flex";
    lowerLeftPopup.innerHTML = `
        <div id="history-menu-top-bar">
            <div id="history-menu-title">History</div>
        </div>
        <div id = 'history-menu'></div>
        `;
    canvasManager.popUpOpen = true;
    let historyButton = document.getElementById('history-button');
    // Calculate the center point of the addShapeButton
    var rect = historyButton.getBoundingClientRect();
    // Convert centerX to string and append 'px', assign as left of popup
    lowerLeftPopup.style.left = historyButton.left + 'px';
    const historyMenu = document.getElementById('history-menu');
    canvasManager.history.forEach(event => {
        const indexOfEvent = canvasManager.history.indexOf(event);
        historyMenu.innerHTML += `<div class = "history-item" id = history-item-${indexOfEvent}></div>`;
        const historyItem = document.getElementById(`history-item-${indexOfEvent}`);
        historyItem.innerHTML = `<div class = "history-item-time">${formatHistoryTimeStamp(event.timeStamp)}</div><div class = "history-item-content"></div>`;
        const historyItemContent = document.querySelector(`#history-item-${indexOfEvent} .history-item-content`);
        if(event.action == "addNodes"){
            event.nodes.forEach(node => {
                if(node.type == "shape"){
                    if(node.shapeType == "elipse"){
                        historyItemContent.innerHTML += `Added elipse`; 
                    }
                }
                historyItemContent.innerHTML += ` at (${Math.round(node.startingX)}, ${Math.round(node.startingY)})<br>`;
            });
        }
        else if(event.action == "removeNodes"){
            event.nodes.forEach(node => {
                if(node.type == "shape"){
                    if(node.shapeType == "elipse"){
                        console.log("elipse found");
                        historyItemContent.innerHTML += `Removed elipse`;
                    }
                }
                historyItemContent.innerHTML += ` at (${Math.round(node.x)}, ${Math.round(node.y)})<br>`;
            });
        }
        else if(event.action == "moveNodes"){
            event.nodes.forEach(node => {
                const nodeIndex = event.nodes.indexOf(node);
                const nodePositions = event.nodesLocationChange[nodeIndex];
                const fromPos = nodePositions.fromPos;
                const toPos = nodePositions.toPos;
                if(node.type == "shape"){
                    if(node.shapeType == "elipse"){
                        historyItemContent.innerHTML += `Moved elipse`;
                    }
                }
                historyItemContent.innerHTML += ` from (${Math.round(fromPos.x)}, ${Math.round(fromPos.y)}) to (${Math.round(toPos.x)}, ${Math.round(toPos.y)})<br>`;
                });
        }
        
    });
    
    historyMenu.innerHTML +=`<button id="history-menu-clear-button">Clear History</button>`;
    setUpHistoryMenuEvents();
    }
    else{
        
        let lowerLeftPopup = document.getElementById('lower-left-popup');
        lowerLeftPopup.style.display = "none";
        lowerLeftPopup.innerHTML = "";
        canvasManager.toggleHistoryMenu = false;
    
    }
}

function updateUndoRedoUI(){
    let undoButton = document.getElementById('undo-button');
    let redoButton = document.getElementById('redo-button');

    let undoButtonImg = document.getElementById('undo-button-img');
    let redoButtonImg = document.getElementById('redo-button-img');

    let historyButton = document.getElementById('history-button');
    let historyButtonImg = document.getElementById('history-button-img');

    if(canvasManager.history.length == 0){
        undoButton.style.cursor = "url('Assets/Images/Cursors/Select/cursor_select.svg') 4 4, auto";
        undoButton.classList.add('button-disabled');
        undoButton.style.backgroundColor = "inherit !important";
        undoButtonImg.src = "Assets/Images/Icons/ui/Button_Undo/undo-disabled.svg";

        historyButton.style.cursor = "url('Assets/Images/Cursors/Select/cursor_select.svg') 4 4, auto";
        historyButton.classList.add('button-disabled');
        historyButton.style.backgroundColor = "inherit !important";
        historyButtonImg.src = "Assets/Images/Icons/ui/Canvas/Lower/History/history-disabled.svg";

    } else {
        undoButton.style.cursor = "url('Assets/Images/Cursors/Pointer/pointer.svg') 14 1, pointer"
        undoButton.classList.remove('button-disabled');
        undoButtonImg.src = "Assets/Images/Icons/ui/Button_Undo/undo.svg";

        historyButton.style.cursor = "url('Assets/Images/Cursors/Pointer/pointer.svg') 14 1, pointer"
        historyButton.classList.remove('button-disabled');
        historyButtonImg.src = "Assets/Images/Icons/ui/Canvas/Lower/History/history.svg";

    }

    if(canvasManager.poppedHistory.length == 0){
        redoButton.style.cursor = "url('Assets/Images/Cursors/Select/cursor_select.svg') 4 4, auto";
        redoButton.classList.add('button-disabled');
        redoButtonImg.src = "Assets/Images/Icons/ui/Button_Redo/redo-disabled.svg";
    } else {
        redoButton.style.cursor = "url('Assets/Images/Cursors/Pointer/pointer.svg') 14 1, pointer";
        redoButton.classList.remove('button-disabled');
        redoButtonImg.src = "Assets/Images/Icons/ui/Button_Redo/redo.svg";
    }
}

function setContentCanvasDetails(canvasManager) {
    let toggleCanvasDetails = "+";
    let canvasDetailsContent = "";
    if (canvasManager.toggleCanvasDetails) {
        toggleCanvasDetails = "-";
        canvasDetailsContent =
            `Canvas Details:<br>
            Width: ${canvasManager.canvas.width}<br>
            Height: ${canvasManager.canvas.height}<br>
            xCenter: ${canvasManager.xCenter}<br>
            yCenter: ${canvasManager.yCenter}<br>
            Scale: ${canvasManager.scale.toFixed(2)}<br>
            TranslateX: ${canvasManager.translateX.toFixed(0)}<br>
            TranslateY: ${canvasManager.translateY.toFixed(0)}<br>
            <br>Current Mouse Coords:<br>
            X: ${canvasManager.currentmousePos.x.toFixed(0)}<br>
            Y: ${canvasManager.currentmousePos.y.toFixed(0)}<br>
            <br>Mouse Down Coords:<br>
            X: ${canvasManager.mousePositionOnDown.x.toFixed(0)}<br>
            Y: ${canvasManager.mousePositionOnDown.y.toFixed(0)}<br>
            <br>Mouse Up Coords:<br>
            X: ${canvasManager.mousePositionOnUp.x.toFixed(0)}<br>
            Y: ${canvasManager.mousePositionOnUp.y.toFixed(0)}<br>
            <br>Mouse Drag Coords:<br>
            X: ${canvasManager.mousePositionOnMoveStart.x.toFixed(0)}<br>
            Y: ${canvasManager.mousePositionOnMoveStart.y.toFixed(0)}<br>
            <br>View Range:<br>
            X: ${Math.round(canvasManager.topLeftX.toFixed(0))} to ${Math.round(canvasManager.bottomRightX.toFixed(2))}<br>
            Y: ${Math.round(canvasManager.topLeftY.toFixed(0))} to ${Math.round(canvasManager.bottomRightY.toFixed(2))}`;
    }
    document.getElementById('toggle-canvas-details').innerHTML = toggleCanvasDetails;
    document.getElementById('canvas-details-content').innerHTML = canvasDetailsContent;
}

function setContentNodeDetails(canvasManager, node = null) {
    let toggleNodeDetails = "+";
    let nodeDetailsContentDynamic = "";
    let nodeDetailsContentStatic = "";

    if (canvasManager.toggleNodeDetails && node) {
        toggleNodeDetails = "-";
        nodeDetailsContentDynamic = `
            <u>${node.name}</u><br>
            Position: ${Math.round(node.x)}, ${Math.round(node.y)}<br>
            X Velocity: ${node.vx.toFixed(2)}<br>
            Y Velocity: ${node.vy.toFixed(2)}<br>
            Size: ${node.size}<br>
            Shape: ${node.shapeType.name}<br>
        `;
        document.getElementById('node-details-content-dynamic').innerHTML = nodeDetailsContentDynamic;

        if (!canvasManager.nodeDetailsStaticContentInit) {
            Logger.log("Initializing static node details content")
            canvasManager.nodeDetailsStaticContentInit = true;
            nodeDetailsContentStatic = ``;
            nodeDetailsContentStatic += `<input type="range" min="30" max="500" value="${node.size}" id="node-size-range"><br>`;
            nodeDetailsContentStatic += `<button id="toggle-node-position-fixed">${node.positionFixed ? "Unfix Position" : "Fix Position"}</button><br>`;
            nodeDetailsContentStatic += `Fill color: <input id ="node-color-picker" value="${node.fill}" data-jscolor="{preset:'small dark', position:'right'}" onclick="canvasManager.blur();"><br> `;
            
            document.getElementById('node-details-content-static').innerHTML = nodeDetailsContentStatic;
            
            // setUpNodeDetailsEvents(canvasManager, node);

        }
    } else {
        canvasManager.toggleNodeDetails = false;
        canvasManager.nodeDetailsStaticContentInit = false;
        document.getElementById('node-details-content-dynamic').innerHTML = "";
        document.getElementById('node-details-content-static').innerHTML = "";
    }

    document.getElementById('toggle-node-details').innerHTML = toggleNodeDetails;
}

export { updateCanvasUI, closeAllPopups, toggleHistoryMenu, updateHistoryMenuUI, toggleNodeDetailsMenu, toggleSelectOrDragMenu, toggleAddShapeMenu };