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
}

function handleMouseDown(event, canvasManager) {
    const { offsetX, offsetY } = event;
    // Check if the central node is clicked
    if (isMouseOver(offsetX, offsetY, canvasManager.centralNode)) {
        canvasManager.centralNode.dragging = true;
        canvasManager.centralNode.dragOffsetX = offsetX - canvasManager.centralNode.x;
        canvasManager.centralNode.dragOffsetY = offsetY - canvasManager.centralNode.y;
        canvasManager.selectedNode = canvasManager.centralNode;
        return;
    }
    // Check each orbital node
    canvasManager.nodes.forEach(node => {
        if (isMouseOver(offsetX, offsetY, node)) {
            node.dragging = true;
            node.dragOffsetX = offsetX - node.x;
            node.dragOffsetY = offsetY - node.y;
            canvasManager.selectedNode = node;
            return;
        }
        else canvasManager.selectedNode = null;
    });
    
}

function handleMouseUp(event, canvasManager) {
    // Reset dragging status for all nodes
    if (canvasManager.centralNode.dragging) {
        canvasManager.centralNode.dragging = false;
    }
    canvasManager.nodes.forEach(node => {
        if (node.dragging) {
            node.dragging = false;
        }
    });
}

function handleMouseMove(event, canvasManager) {
    const { offsetX, offsetY } = event;
    if (canvasManager.centralNode.dragging) {
        canvasManager.centralNode.x = offsetX - canvasManager.centralNode.dragOffsetX;
        canvasManager.centralNode.y = offsetY - canvasManager.centralNode.dragOffsetY;
        canvasManager.draw();
    }
    canvasManager.nodes.forEach(node => {
        if (node.dragging) {
            node.x = offsetX - node.dragOffsetX;
            node.y = offsetY - node.dragOffsetY;
            canvasManager.draw();
        }
    });
}

function isMouseOver(mouseX, mouseY, node) {
    // Check if the mouse is over a node, assuming circular nodes for simplicity
    const dx = mouseX - node.x;
    const dy = mouseY - node.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < node.size / 2;
}

export { setupEventListeners };
