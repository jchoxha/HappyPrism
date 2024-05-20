import { Logger } from "../Debug/logger.js";
function setUpUserEvents(canvasManager){
    const mouseEvents = ['mousedown', 'mouseup', 'mousemove', 'wheel'];
    const touchEvents = ['touchstart', 'touchend', 'touchmove', 'touchcancel'];

    mouseEvents.forEach(event => {
        canvasManager.canvas.addEventListener(event, (event) => {
            handleEvent(event, canvasManager);
        }, { passive: false });
    });

    touchEvents.forEach(event => {
        canvasManager.canvas.addEventListener(event, (event) => {
            handleTouchEvent(event, canvasManager);
        }, { passive: false });
    });

}

let initialPinchDistance = null;
let lastScale = 1;

function handleTouchEvent(event, canvasManager) {
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
        handleEvent(event, canvasManager);
    }

    if (event.type === 'touchend' || event.type === 'touchcancel') {
        initialPinchDistance = null;
        handleEnd(event, canvasManager);
    }
}

function handleEvent(event, canvasManager) {
    switch (event.type) {
        case 'mousedown':
        case 'touchstart':
            handleStart(event, canvasManager);
            break;
        case 'mouseup':
        case 'touchend':
            handleEnd(event, canvasManager);
            break;
        case 'mousemove':
        case 'touchmove':
            handleMove(event, canvasManager);
            break;
        case 'wheel':
            handleWheel(event, canvasManager);
            break;
    }
}


function handleStart(event, canvasManager) {
    let nodeFound = false;
    canvasManager.mousePositionOnDown = { x: canvasManager.currentmousePos.x, y: canvasManager.currentmousePos.y }
    Logger.log("Mouse down at: ", canvasManager.mousePositionOnDown);

    
    for (let i = canvasManager.nodes.length - 1; i >= 0; i--) {
        const node = canvasManager.nodes[i];
        if (isMouseOver(node, canvasManager)) {
            Logger.log("Mouse over: ", node);
            if (canvasManager.highlightedNode == node && canvasManager.selectedNode != node) {
                canvasManager.selectedNode = node;
                Logger.log("Node selected: ", node)
            }
            else if (canvasManager.selectedNode != node) {
                canvasManager.highlightedNode = node;
                canvasManager.toggleNodeDetails = true;
                canvasManager.nodeDetailsStaticContentInit = false;
                Logger.log("Node highlighted: ", node);
            }
            if (canvasManager.selectedNode == node){
                
                node.dragging = true;
                canvasManager.highlightedNode = node;
                canvasManager.toggleNodeDetails = true;
                canvasManager.nodeDetailsStaticContentInit = false;
                canvasManager.mousePositionOnMoveStart.x = canvasManager.currentmousePos.x;
                canvasManager.mousePositionOnMoveStart.y = canvasManager.currentmousePos.y;
            }
            nodeFound = true;
            return;  // Stop searching once a node is found
        }
    }


    // Log the state if no nodes are selected
    if (!nodeFound) {
        if (!canvasManager.draggingCanvas) {
            canvasManager.draggingCanvas = true;
            canvasManager.mousePositionOnMoveStart.x = canvasManager.currentmousePos.x;
            canvasManager.mousePositionOnMoveStart.y = canvasManager.currentmousePos.y;
            Logger.log("draggingCanvas: ", canvasManager.draggingCanvas);
        }
        
        Logger.log("No node was selected");
        canvasManager.selectedNode = null;
        canvasManager.highlightedNode = null;
    }
}

function handleEnd(event, canvasManager) {
    canvasManager.mousePositionOnUp = { x: canvasManager.currentmousePos.x, y: canvasManager.currentmousePos.y };
    canvasManager.draggingCanvas = false;

    const now = canvasManager.currentTime;

    canvasManager.nodes.forEach(node => {
        if (node.dragging) {
            if (canvasManager.currentTime > canvasManager.mouseLastMoveTime) {
                Logger.log("Node velocity canceled because " + (canvasManager.currentTime - canvasManager.mouseLastMoveTime) + " < 300");
                node.vx = 0;
                node.vy = 0;
            }
            node.dragging = false;
            node.inMovementAfterDragging = true;
        }
    });
}



function handleMove(event, canvasManager) {

    if (canvasManager.draggingCanvas) {
        const dx = (canvasManager.currentmousePos.x - canvasManager.mousePositionOnMoveStart.x) * canvasManager.scale;
        const dy = (canvasManager.currentmousePos.y - canvasManager.mousePositionOnMoveStart.y) * canvasManager.scale;
        canvasManager.translateX += dx;
        canvasManager.translateY += dy;
    } else {
        canvasManager.nodes.forEach(node => {
            if (isMouseOver(node, canvasManager)) {
                node.hovered = true; // Additional property to indicate node is hovered
            } else {
                node.hovered = false;
            }
            if (node.dragging) {
                const dx = (canvasManager.currentmousePos.x - canvasManager.mousePositionOnMoveLast.x);
                const dy = (canvasManager.currentmousePos.y - canvasManager.mousePositionOnMoveLast.y);

                const newX = node.x + dx;
                const newY = node.y + dy;

                node.vx = newX - node.x;
                node.vy = newY - node.y;

                node.x = newX;
                node.y = newY;

                if (!node.positionFixed) {
                    node.intendedX = node.x;
                    node.intendedY = node.y;
                }
            }
        });
    }
    canvasManager.mousePositionOnMoveLast.x = canvasManager.currentmousePos.x;
    canvasManager.mousePositionOnMoveLast.y = canvasManager.currentmousePos.y;
    canvasManager.mouseLastMoveTime = canvasManager.currentTime;
    updateMouseProperties(event, canvasManager);
}




function updateMouseProperties(event, canvasManager) {
    const rect = canvasManager.canvas.getBoundingClientRect();
    canvasManager.currentmousePos.x = (event.clientX - (rect.left / 2) - canvasManager.translateX) / canvasManager.scale;
    canvasManager.currentmousePos.y = (event.clientY - (rect.top / 2) - canvasManager.translateY) / canvasManager.scale;
}



function isMouseOver(node, canvasManager) {
    const mouseX = canvasManager.currentmousePos.x;
    const mouseY = canvasManager.currentmousePos.y;

    // Calculate the distance between the mouse position and the node center
    const dx = mouseX - node.x;
    const dy = mouseY - node.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if the distance is within the node's size (assuming the node size represents the diameter)
    return distance < node.size / 2;
}


function handleWheel(event, canvasManager) {
    if (shouldPreventDefault(event, canvasManager)) {
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
}

// This function decides when to call preventDefault based on your specific logic
function shouldPreventDefault(event, canvasManager) {
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

export { setUpUserEvents };