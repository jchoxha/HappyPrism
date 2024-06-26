import { Logger } from "../../Debug/logger.js";
import {setUpCanvasBarEvents, updateCanvasBarEvents} from "./canvasBarEvents.js"
import { closeAllPopups, toggleNodeDetailsMenu } from "../../UI/canvasUI.js"
import { addNodes, moveNodes } from "../../Classes/nodeClass.js";
import { drawTempNodeBoundingBox, drawTempBoundingBoxAroundSelectedNodes } from "../../Classes/Canvas/methods/drawCanvas.js";

let canvasManager = null;


function setUpCanvasEvents(appManager){
    canvasManager = appManager.canvasManager;
    setUpKeyEvents();
    setUpCanvasPointerEvents();
    setUpCanvasBarEvents(appManager);
}

function updateCanvasEvents(appManager){
    canvasManager = appManager.canvasManager;
    updateCanvasBarEvents(appManager);
}

function setUpCanvasUIEvents(canvasManager) {
    // const addButton = document.getElementById('add-node');
    // const removeButton = document.getElementById('remove-node');
    // const toggleNodeDetails = document.getElementById('toggle-node-details');
    // const toggleCanvasDetails = document.getElementById('toggle-canvas-details');

    // addButton.addEventListener('click', () => {
    //     // If no node is selected, add a new node without a parent
    //     if (!canvasManager.highlightedNode) {
    //         canvasManager.highlightedNode = addNode(canvasManager);
    //     } else {
    //         // Add a child node to the selected node
    //         addNode(canvasManager);
    //     }
    // });

    // removeButton.addEventListener('click', () => {
    //     const modal = document.getElementById('confirmation-modal');
    //     if (canvasManager.highlightedNode && modal) {
    //         let modalContent = `
    //         <div id="confirmation-modal-content">
    //             <p>Are you sure you want to remove this node?</p>
    //             <button id="confirm-remove-node">Yes (Permanent)</button>
    //             <button id="cancel-remove-node">Cancel</button>
    //         </div>`;
    //         modal.innerHTML = modalContent;
    //         modal.style.display = 'block'; // Show the modal    
    //         document.getElementById('confirm-remove-node').onclick = () => {
    //             removeNode(canvasManager.nodes, canvasManager.highlightedNode);
    //             modal.innerHTML = "";
    //             modal.style.display = 'none';
    //         };    
    //         document.getElementById('cancel-remove-node').onclick = () => {
    //             modal.innerHTML = "";
    //             modal.style.display = 'none';
    //         };
    //     }
    // });
    // toggleNodeDetails.addEventListener('click', () => {
    //     canvasManager.toggleNodeDetails = !canvasManager.toggleNodeDetails;
    // });        
    // toggleCanvasDetails.addEventListener('click', () => {
    //     canvasManager.toggleCanvasDetails = !canvasManager.toggleCanvasDetails;
    // });
}

function setUpNodeDetailsEvents(canvasManager, node) {
    // //Node size Slider Event Listeners
    // const nodeSizeRange = document.getElementById('node-size-range');
    // nodeSizeRange.addEventListener('input', function () {
    //     node.isResizing = true;
    //     node.size = Number(nodeSizeRange.value);
    // });

    // nodeSizeRange.addEventListener('change', function () {
    //     node.isResizing = false;
    //     canvasManager.nodeDetailsStaticContentInit = false;  // Only reset this on change, not input
    // });

    // nodeSizeRange.addEventListener('mouseout', function () {
    //     node.isResizing = false;
    // });

    // //Node Position Fixed Toggle Button Event Listener
    // const positionToggleButton = document.getElementById('toggle-node-position-fixed');
    // positionToggleButton.onclick = () => {
    //     node.positionFixed = !node.positionFixed;
    //     if (node.positionFixed) {
    //         node.fixedX = node.x;
    //         node.fixedY = node.y;
    //         positionToggleButton.textContent = node.positionFixed ? "Unfix Position" : "Fix Position";
    //         canvasManager.nodeDetailsStaticContentInit = false;
    //     }
    // };

    // //Node Color Picker Event Listener
    // const nodeColorPicker = document.getElementById('node-color-picker');
    // new jscolor(nodeColorPicker);
    // nodeColorPicker.addEventListener('input', function () {
    //     node.fill = nodeColorPicker.value;
    //     canvasManager.nodeDetailsStaticContentInit = false;
    // });
}

//Keyboard / Mouse shortcuts:
/*


    V: Toggle Select or Drag Canvas / Pan, default to Select first
    H or hold Space : Drag Canvas / Pan
    Mouse Wheel: Drag canvas / Pan from point
    Hold Ctrl + Scroll: Zoom in/out
    Scroll: Scroll up/down or left/right



*/
function setUpKeyEvents(){
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
}



function handleKeyDown(event) {
    // Check if the key pressed is the space bar (key code 32)
    if (event.code === 'Space' || event.keyCode === 32) {
        if(canvasManager.interactionMode == "selectCanvas"){
            canvasManager.IM2tempCanvasDrag = true;
            canvasManager.setCanvasManagerInteractionMode("dragCanvas");
        }
    }
}

function handleKeyUp(event) {
    // Check if the key released is the space bar (event.code === 'Space')
    if (event.code === 'Space') {
        if(canvasManager.IM2tempCanvasDrag){
            canvasManager.IM2tempCanvasDrag = false;
            canvasManager.setCanvasManagerInteractionMode("selectCanvas");
        }
        
    }
}

function setUpCanvasPointerEvents(){
    const mouseEvents = ['mousedown', 'mouseup', 'mousemove', 'wheel'];
    const touchEvents = ['touchstart', 'touchend', 'touchmove', 'touchcancel'];

    mouseEvents.forEach(event => {
        canvasManager.canvas.addEventListener(event, (event) => {
            handlePointerEvent(event);
        }, { passive: false });
    });

    touchEvents.forEach(event => {
        canvasManager.canvas.addEventListener(event, (event) => {
            handleTouchEvent(event);
        }, { passive: false });
    });

}

let initialPinchDistance = null;
let lastScale = 1;

function handleTouchEvent(event) {
    if (event.touches.length > 1) {
        // Handle pinch
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];

        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (event.type === 'touchmove') {
            if (initialPinchDistance != null) {
                const scaleRatio = distance / initialPinchDistance;
                const newScale = lastScale * scaleRatio;
                canvasManager.scale = Math.max(0.1, Math.min(newScale, 10)); // Adjust limits as necessary
            }
        } else if (event.type === 'touchstart') {
            initialPinchDistance = distance;
            lastScale = canvasManager.scale;
        }

        event.preventDefault(); // Prevent the browser from doing its default pinch-to-zoom
    } else if (event.touches.length === 1 && event.type !== 'touchend' && event.type !== 'touchcancel') {
        // Normalize touch events to behave like mouse events for single touch
        const touch = event.touches[0];
        event.clientX = touch.clientX;
        event.clientY = touch.clientY;
        handlePointerEvent(event);
    }

    if (event.type === 'touchend' || event.type === 'touchcancel') {
        initialPinchDistance = null;
        handleEnd(event);
    }
}

function handlePointerEvent(event) {
    switch (event.type) {
        case 'mousedown':
        case 'touchstart':
            handleStart(event);
            break;
        case 'mouseup':
        case 'touchend':
            handleEnd(event);
            break;
        case 'mousemove':
        case 'touchmove':
            handleMove(event);
            break;
        case 'wheel':
            handleWheel(event);
            break;
    }
}


function handleStart(event) {
    let nodeFound = false;
    
    canvasManager.mousePositionOnDown = { x: canvasManager.currentmousePos.x, y: canvasManager.currentmousePos.y }
    console.log("Mouse down at: ", canvasManager.mousePositionOnDown);
    closeAllPopups();
    if (canvasManager.interactionMode == "selectCanvas"){
        for (let i = canvasManager.nodes.length - 1; i >= 0; i--) {
            const node = canvasManager.nodes[i];
            if (isMouseOver(node, canvasManager)) {
                Logger.log("Mouse over: ", node);

                canvasManager.IM1nodesBeingDragged.length = 0;

                if (canvasManager.IM1selectedNodes.length > 0){
                    if(canvasManager.IM1selectedNodes.includes(node)){
                        canvasManager.IM1selectedNodes.forEach(selectedNode => {
                            selectedNode.dragOffsetX = selectedNode.x - canvasManager.currentmousePos.x;
                            selectedNode.dragOffsetY = selectedNode.y - canvasManager.currentmousePos.y;
                            selectedNode.xBeforeMove = selectedNode.x;
                            selectedNode.yBeforeMove = selectedNode.y;
                            canvasManager.IM1nodesBeingDragged.push(selectedNode);
                        });
                    }
                }
                else{
                    canvasManager.IM1selectedNodes.length = 0;
                    node.dragOffsetX = node.x - canvasManager.currentmousePos.x;
                    node.dragOffsetY = node.y - canvasManager.currentmousePos.y;
                    node.xBeforeMove = node.x;
                    node.yBeforeMove = node.y;
                    canvasManager.IM1nodesBeingDragged.push(node);
                }
                canvasManager.IM1draggingNodes = true;
                canvasManager.IM1movedAfterDraggingNodes = false;
                nodeFound = true;
                return;  // Stop searching once a node is found
            }
        }
        if (!nodeFound) {
            Logger.log("No node was selected, beginning selection box drag");
            canvasManager.IM1selectedNodes.length = 0;
            canvasManager.selectedNode = null;
            canvasManager.highlightedNode = null;
            canvasManager.IM1draggingSelectionBox = true;
            canvasManager.IM1selectionBoxDetectedNodes.length = 0;
            canvasManager.IM1selectionBoxStartPos = { x: canvasManager.mousePositionOnDown.x, y: canvasManager.mousePositionOnDown.y };
        }        
    }

    if (canvasManager.interactionMode == "dragCanvas"){
        document.getElementById("canvas").style.cursor = "url('Assets/Images/Cursors/Drag/hand-closed.svg')16 17, auto";
        if (!canvasManager.draggingCanvas) {
            canvasManager.draggingCanvas = true;
            canvasManager.mousePositionOnMoveStart.x = canvasManager.currentmousePos.x;
            canvasManager.mousePositionOnMoveStart.y = canvasManager.currentmousePos.y;
            Logger.log("draggingCanvas: ", canvasManager.draggingCanvas);
            canvasManager.setNeedsUpdating(true);

        }
    }
    if (canvasManager.interactionMode == "addShape"){
        canvasManager.IM1selectedNodes.length = 0;
        canvasManager.IM3draggingShape = true;
        canvasManager.IM3shapeStartPos = { x: canvasManager.mousePositionOnDown.x, y: canvasManager.mousePositionOnDown.y };
        canvasManager.IM3shapeEndPos = canvasManager.IM3shapeStartPos;
    }
}

function handleMove(event) {
    if (canvasManager.interactionMode == "selectCanvas"){
        if(canvasManager.IM1draggingNodes){
            canvasManager.IM1movedAfterDraggingNodes = true;
            canvasManager.IM1nodesBeingDragged.forEach(node => {
                node.x = canvasManager.currentmousePos.x + node.dragOffsetX;
                node.y = canvasManager.currentmousePos.y + node.dragOffsetY;
            });
            canvasManager.setNeedsUpdating(true, 1);
        }
        else if (canvasManager.IM1draggingSelectionBox){
            canvasManager.IM1selectionBoxEndPos = { x: canvasManager.currentmousePos.x, y: canvasManager.currentmousePos.y };
            canvasManager.drawTempShape();
            canvasManager.IM1selectionBoxDetectedNodes.length = 0;
            for (let i = canvasManager.nodes.length - 1; i >= 0; i--) {
                const node = canvasManager.nodes[i];
                if (isSelectionOver(node)) {
                    // Logger.log("Selection over: ", node);
                    if(!canvasManager.IM1selectionBoxDetectedNodes.includes(node)){
                    canvasManager.IM1selectionBoxDetectedNodes.push(node);
                    }
                    drawTempNodeBoundingBox(canvasManager, node);
                    if(!canvasManager.IM1selectedNodes.length > 0){
                        drawTempBoundingBoxAroundSelectedNodes(canvasManager);
                    }
                }
            }
        }
        else {
            let nodeIndex = -1;
            canvasManager.nodes.forEach(node => {
                    if (isMouseOver(node, canvasManager)) {
                         nodeIndex = canvasManager.nodes.indexOf(node);
                        // Do something with the node index
                        return; // Stop iterating through the nodes array
                    }
            });
            if(nodeIndex != -1){
                canvasManager.nodes[nodeIndex]
            }
        }
    }
    if(canvasManager.interactionMode == "dragCanvas"){
        if (canvasManager.draggingCanvas) {
            const dx = (canvasManager.currentmousePos.x - canvasManager.mousePositionOnMoveStart.x) * canvasManager.scale;
            const dy = (canvasManager.currentmousePos.y - canvasManager.mousePositionOnMoveStart.y) * canvasManager.scale;
            canvasManager.translateX += dx;
            canvasManager.translateY += dy;
         } 
        //else {
        //     canvasManager.nodes.forEach(node => {
        //         if (isMouseOver(node, canvasManager)) {
        //             node.hovered = true; // Additional property to indicate node is hovered
        //         } else {
        //             node.hovered = false;
        //         }
        //         if (node.dragging) {
        //             const dx = (canvasManager.currentmousePos.x - canvasManager.mousePositionOnMoveLast.x);
        //             const dy = (canvasManager.currentmousePos.y - canvasManager.mousePositionOnMoveLast.y);

        //             const newX = node.x + dx;
        //             const newY = node.y + dy;

        //             node.vx = newX - node.x;
        //             node.vy = newY - node.y;

        //             node.x = newX;
        //             node.y = newY;

        //             if (!node.positionFixed) {
        //                 node.intendedX = node.x;
        //                 node.intendedY = node.y;
        //             }
        //         }
        //     });
        // }
    }
    if(canvasManager.interactionMode == "addShape" && canvasManager.IM3draggingShape){
        canvasManager.IM3shapeEndPos = { x: canvasManager.currentmousePos.x, y: canvasManager.currentmousePos.y };
        canvasManager.drawTempShape();
    }
    canvasManager.mousePositionOnMoveLast.x = canvasManager.currentmousePos.x;
    canvasManager.mousePositionOnMoveLast.y = canvasManager.currentmousePos.y;
    canvasManager.mouseLastMoveTime = canvasManager.currentTime;
    updateMouseProperties(event, canvasManager);
}

function handleEnd(event) {
    canvasManager.mousePositionOnUp = { x: canvasManager.currentmousePos.x, y: canvasManager.currentmousePos.y };
    if (canvasManager.interactionMode == "selectCanvas"){
        if(canvasManager.IM1draggingNodes){
            canvasManager.IM1nodesBeingDragged.forEach(node => {
                if(node.xBeforeMove != node.x || node.yBeforeMove != node.y){
                    node.positionHistory[node.currentPositionIndex + 1] = { x: node.x, y: node.y };
                    node.currentPositionIndex++;
                }
            });
            moveNodes(canvasManager);
            canvasManager.IM1draggingNodes = false;
            if(canvasManager.IM1movedAfterDraggingNodes){
                
            }
        }
        else if (canvasManager.IM1draggingSelectionBox){
        if(canvasManager.IM1selectionBoxDetectedNodes.length > 0){
            canvasManager.IM1selectedNodes.length = 0;
            canvasManager.IM1selectionBoxDetectedNodes.forEach(node => {
                canvasManager.IM1selectedNodes.push(node);
            });
        }
        canvasManager.IM1draggingSelectionBox = false;
        canvasManager.setNeedsUpdating(true, 1);
        }
    }
    if (canvasManager.interactionMode == "dragCanvas"){
        document.getElementById("canvas").style.cursor = "url('Assets/Images/Cursors/Drag/hand-open.svg') 16 16, auto";
        if(canvasManager.draggingCanvas)
            {
                canvasManager.draggingCanvas = false;
                canvasManager.setNeedsUpdating(false);
            }
    }
    if (canvasManager.interactionMode == "addShape") {
            //canvasManager.IM3shapeEndPos = canvasManager.mousePositionOnUp;
            const buffer = 1;
            const xDiff = Math.abs(canvasManager.IM3shapeEndPos.x - canvasManager.IM3shapeStartPos.x);
            const yDiff = Math.abs(canvasManager.IM3shapeEndPos.y - canvasManager.IM3shapeStartPos.y);
            if(xDiff < buffer && yDiff < buffer){
                Logger.log(`Difference between shapeStartPos & shapeEndPos (${xDiff}, ${yDiff}) did not exceed buffer of ${buffer}px, using dimensions of last shape`);
                const radiusX = canvasManager.IM3shapeDims.width / 2;
                const radiusY = canvasManager.IM3shapeDims.height / 2;
                console.log("radiusX & y " + radiusX + " "+radiusY);

                canvasManager.IM3shapeStartPos = { x: canvasManager.currentmousePos.x - radiusX, y: canvasManager.currentmousePos.y - radiusY };
                canvasManager.IM3shapeEndPos = { x: canvasManager.currentmousePos.x + radiusX, y: canvasManager.currentmousePos.y + radiusY};
            }

            addNodes(canvasManager, "shape");
            canvasManager.IM3draggingShape = false;
    }
}








function updateMouseProperties(event) {
    const rect = canvasManager.canvas.getBoundingClientRect();
    canvasManager.currentmousePos.x = (event.clientX - (rect.left / 2) - canvasManager.translateX) / canvasManager.scale;
    canvasManager.currentmousePos.y = (event.clientY - (rect.top / 2) - canvasManager.translateY) / canvasManager.scale;
}



function isMouseOver(node) {
    const mouseX = canvasManager.currentmousePos.x;
    const mouseY = canvasManager.currentmousePos.y;
    if(node.type == "shape"){
        if(node.shapeType == "elipse"){

            var distance = Math.pow(mouseX - node.x, 2) / Math.pow(node.shapeWidth / 2, 2) + Math.pow(mouseY - node.y,2) / Math.pow(node.shapeHeight / 2,2);
            
            return distance < 1;
        }
    }
    // Check if the distance is within the node's size (assuming the node size represents the diameter)
    return distance < node.size / 2;
}

function isSelectionOver(node) {
    // Get the bounds of the selection box
    const startX = Math.min(canvasManager.IM1selectionBoxStartPos.x, canvasManager.IM1selectionBoxEndPos.x);
    const endX = Math.max(canvasManager.IM1selectionBoxStartPos.x, canvasManager.IM1selectionBoxEndPos.x);
    const startY = Math.min(canvasManager.IM1selectionBoxStartPos.y, canvasManager.IM1selectionBoxEndPos.y);
    const endY = Math.max(canvasManager.IM1selectionBoxStartPos.y, canvasManager.IM1selectionBoxEndPos.y);

    if (node.type === "shape" && node.shapeType === "elipse") {
        // Parameters of the ellipse
        const h = node.x;
        const k = node.y;
        const a = node.shapeWidth / 2;
        const b = node.shapeHeight / 2;

        // Check if any point on the ellipse's perimeter is within the selection box
        for (let angle = 0; angle < 360; angle += 1) {
            const rad = angle * (Math.PI / 180);
            const ellipseX = h + a * Math.cos(rad);
            const ellipseY = k + b * Math.sin(rad);

            if (ellipseX >= startX && ellipseX <= endX && ellipseY >= startY && ellipseY <= endY) {
                return true;
            }
        }

        return false;
    }

    // Default case for other node types (if needed)
    return false;
}

function handleWheel(event) {
    if (shouldPreventDefault(event)) {
        event.preventDefault();  // Prevent the page from scrolling
    }

    const zoomIntensity = 0.1;
    const mouseX = canvasManager.currentmousePos.x;
    const mouseY = canvasManager.currentmousePos.y;

    const delta = event.deltaY > 0 ? -zoomIntensity : zoomIntensity;
    const newScale = canvasManager.scale + delta;

    // Constrain zoom level
    const scale = Math.max(0.1, Math.min(newScale, 10));
    
    // Adjust translateX and translateY to keep the zoom centered around the mouse position
    canvasManager.translateX -= mouseX * (scale - canvasManager.scale);
    canvasManager.translateY -= mouseY * (scale - canvasManager.scale);
    
    canvasManager.scale = scale;
    //Update the canvas once
    canvasManager.setNeedsUpdating(true, 1);
}

// This function decides when to call preventDefault based on your specific logic
function shouldPreventDefault(event) {
    const rect = canvasManager.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    // Add more conditions as needed to decide when to prevent default
    return x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
}

function getOffsets(clientX, clientY, canvas) {
    const rect = canvas.getBoundingClientRect();
    return {
        offsetX: clientX - rect.left,
        offsetY: clientY - rect.top
    };
}

export { setUpCanvasEvents, updateCanvasEvents };