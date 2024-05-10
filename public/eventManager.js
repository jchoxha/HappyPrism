// eventManager.js

function setupEventListeners(canvasManager) {
    canvasManager.canvas.addEventListener('mousedown', (event) => {
        handleMouseDown(event, canvasManager);
    });

    canvasManager.canvas.addEventListener('mouseup', (event) => {
        handleMouseUp(event, canvasManager);
    });

    canvasManager.canvas.addEventListener('mousemove', (event) => {
        handleMouseMove(event, canvasManager);
    });
    canvasManager.canvas.addEventListener('wheel', event => handleWheel(event, canvasManager), { passive: false });

}

function handleMouseDown(event, canvasManager) {
    const { offsetX, offsetY } = event;
    let nodeFound = false;
    canvasManager.mousePositionOnDown = { x: canvasManager.currentmousePos.x, y: canvasManager.currentmousePos.y }
    console.log("Mouse down at: ", canvasManager.mousePositionOnDown);

    
    for (let i = canvasManager.nodes.length - 1; i >= 0; i--) {
        const node = canvasManager.nodes[i];
        if (isMouseOver(offsetX, offsetY, node, canvasManager)) {
            if (canvasManager.highlightedNode == node && canvasManager.selectedNode != node) {
                if((node.parent && canvasManager.selectedNode != node.parent) 
                || (!node.parent)){ 
                    canvasManager.selectedNode = node;
                    console.log("Node selected: ", node)
                    }
            }
            else if (canvasManager.selectedNode != node) {
                canvasManager.highlightedNode = node;
                console.log("Node highlighted: ", node);
            }
            if (canvasManager.selectedNode == node || canvasManager.selectedNode == node.parent && node.parent != null){
                
                node.dragging = true;
                canvasManager.mousePositionOnDrag.x = canvasManager.currentmousePos.x;
                canvasManager.mousePositionOnDrag.y = canvasManager.currentmousePos.y;
            }
            nodeFound = true;
            return;  // Stop searching once a node is found
        }
    }


    // Log the state if no nodes are selected
    if (!nodeFound) {
        if (!canvasManager.draggingCanvas) {
            canvasManager.draggingCanvas = true;
            canvasManager.mousePositionOnDrag.x = canvasManager.currentmousePos.x;
            canvasManager.mousePositionOnDrag.y = canvasManager.currentmousePos.y;
            console.log("draggingCanvas: ", canvasManager.draggingCanvas);
        }
        
        console.log("No node was selected");
        canvasManager.selectedNode = null;
        canvasManager.highlightedNode = null;
    }
}

function handleMouseUp(event, canvasManager) {
    canvasManager.mousePositionOnUp = { x: canvasManager.currentmousePos.x, y: canvasManager.currentmousePos.y }
    console.log("Mouse up at: ", canvasManager.mousePositionOnUp);
    canvasManager.draggingCanvas = false;

    // Reset dragging status for all nodes
    canvasManager.nodes.forEach(node => {
        if (node.dragging) {
            node.dragging = false;
            
            console.log("Node dragging ended for node:" + node);
            // node.inMovementAfterDragging = true;
            // console.log("Movement after dragging starting for: " + node)
            // console.log("currentmouseV.x: " + canvasManager.currentmouseV.x);
            node.vx = 0;
            node.vy = 0;
            
        }
    });
}

function handleMouseMove(event, canvasManager) {

    if (canvasManager.draggingCanvas) {
        const dx = (canvasManager.currentmousePos.x - canvasManager.mousePositionOnDrag.x) * canvasManager.scale;
        const dy = (canvasManager.currentmousePos.y - canvasManager.mousePositionOnDrag.y) * canvasManager.scale;
        canvasManager.translateX += dx;
        canvasManager.translateY += dy;

    } else {
        canvasManager.nodes.forEach(node => {
            if (node.dragging) {
                const dx = (canvasManager.currentmousePos.x - canvasManager.mousePositionOnDrag.x) * canvasManager.scale;
                const dy = (canvasManager.currentmousePos.y - canvasManager.mousePositionOnDrag.y) * canvasManager.scale;
                node.x += dx / canvasManager.scale; 
                node.y += dy/ canvasManager.scale;
                // Update the base point for the next move
                canvasManager.mousePositionOnDrag.x = canvasManager.currentmousePos.x;
                canvasManager.mousePositionOnDrag.y = canvasManager.currentmousePos.y;
            }
        });
    }
    canvasManager.draw();
    updateMouseProperties(event, canvasManager);
}

function updateMouseProperties(event, canvasManager) {
    const rect = canvasManager.canvas.getBoundingClientRect();
    canvasManager.currentmousePos.x = (event.clientX - rect.left - canvasManager.translateX) / canvasManager.scale;
    canvasManager.currentmousePos.y = (event.clientY - rect.top - canvasManager.translateY) / canvasManager.scale;
    
}


function isMouseOver(mouseX, mouseY, node, canvasManager) {
    // Check if the mouse is over a node, assuming circular nodes for simplicity
    const adjustedX = (mouseX - canvasManager.translateX) / canvasManager.scale;
    const adjustedY = (mouseY - canvasManager.translateY) / canvasManager.scale;
    const dx = adjustedX - node.x;
    const dy = adjustedY - node.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < node.size / 2;
}

function handleWheel(event, canvasManager) {
    // Check if the event is occurring inside the canvas or another specific area where you want to disable scrolling
    if (shouldPreventDefault(event, canvasManager)) {
        event.preventDefault();  // Prevent the page from scrolling
    }
    
    const zoomIntensity = 0.1;
    const delta = event.deltaY > 0 ? -zoomIntensity : zoomIntensity;
    const newScale = canvasManager.scale + delta;
    canvasManager.scale = Math.max(0.1, Math.min(newScale, 10)); // Constrain zoom level
    canvasManager.draw();
}

// This function decides when to call preventDefault based on your specific logic
function shouldPreventDefault(event, canvasManager) {
    const rect = canvasManager.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    // Add more conditions as needed to decide when to prevent default
    return x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
}

export { setupEventListeners };
