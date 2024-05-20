import { Logger } from '../Debug/logger.js';
import { addNode, removeNode } from '../Classes/nodeClass.js';

function setUpUiEvents(canvasManager) {
    setUpNavBarEvents();
    setUpCanvasUIEvents(canvasManager);
}

function setUpNavBarEvents() {
    document.getElementById('back-button').addEventListener('click', function() {
        // Add your logic to navigate to the higher-level page
        Logger.log('Back button clicked');
    });

    document.getElementById('settings-button').addEventListener('click', function() {
        // Add your logic to open settings
        Logger.log('Settings button clicked');
    });
}

function setUpCanvasUIEvents(canvasManager) {
    const addButton = document.getElementById('add-node');
    const removeButton = document.getElementById('remove-node');
    const toggleNodeDetails = document.getElementById('toggle-node-details');
    const toggleCanvasDetails = document.getElementById('toggle-canvas-details');

    addButton.addEventListener('click', () => {
        // If no node is selected, add a new node without a parent
        if (!canvasManager.highlightedNode) {
            canvasManager.highlightedNode = addNode(canvasManager);
        } else {
            // Add a child node to the selected node
            addNode(canvasManager);
        }
    });

    removeButton.addEventListener('click', () => {
        const modal = document.getElementById('confirmation-modal');
        if (canvasManager.highlightedNode && modal) {
            let modalContent = `
            <div id="confirmation-modal-content">
                <p>Are you sure you want to remove this node?</p>
                <button id="confirm-remove-node">Yes (Permanent)</button>
                <button id="cancel-remove-node">Cancel</button>
            </div>`;
            modal.innerHTML = modalContent;
            modal.style.display = 'block'; // Show the modal    
            document.getElementById('confirm-remove-node').onclick = () => {
                removeNode(canvasManager.nodes, canvasManager.highlightedNode);
                modal.innerHTML = "";
                modal.style.display = 'none';
            };    
            document.getElementById('cancel-remove-node').onclick = () => {
                modal.innerHTML = "";
                modal.style.display = 'none';
            };
        }
    });
    toggleNodeDetails.addEventListener('click', () => {
        canvasManager.toggleNodeDetails = !canvasManager.toggleNodeDetails;
    });        
    toggleCanvasDetails.addEventListener('click', () => {
        canvasManager.toggleCanvasDetails = !canvasManager.toggleCanvasDetails;
    });
}

function setUpNodeDetailsEvents(canvasManager, node) {
    //Node size Slider Event Listeners
    const nodeSizeRange = document.getElementById('node-size-range');
    nodeSizeRange.addEventListener('input', function () {
        node.isResizing = true;
        node.size = Number(nodeSizeRange.value);
    });

    nodeSizeRange.addEventListener('change', function () {
        node.isResizing = false;
        canvasManager.nodeDetailsStaticContentInit = false;  // Only reset this on change, not input
    });

    nodeSizeRange.addEventListener('mouseout', function () {
        node.isResizing = false;
    });

    //Node Position Fixed Toggle Button Event Listener
    const positionToggleButton = document.getElementById('toggle-node-position-fixed');
    positionToggleButton.onclick = () => {
        node.positionFixed = !node.positionFixed;
        if (node.positionFixed) {
            node.fixedX = node.x;
            node.fixedY = node.y;
            positionToggleButton.textContent = node.positionFixed ? "Unfix Position" : "Fix Position";
            canvasManager.nodeDetailsStaticContentInit = false;
        }
    };

    //Node Color Picker Event Listener
    const nodeColorPicker = document.getElementById('node-color-picker');
    new jscolor(nodeColorPicker);
    nodeColorPicker.addEventListener('input', function () {
        node.fill = nodeColorPicker.value;
        canvasManager.nodeDetailsStaticContentInit = false;
    });
}


export { setUpUiEvents, setUpNodeDetailsEvents };