import { addNode, removeNode } from '../Classes/nodeClass.js';

function setUpUiEvents(canvasManager) {
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

export { setUpUiEvents };