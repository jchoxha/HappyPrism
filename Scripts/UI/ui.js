import { updateCanvasUI } from "./canvasUI.js";

function loadUI(uiVersion){
    switch
    (uiVersion){
        case "default":
            loadUIDefault();
            break;
    }
}

function updateUI (canvasManager){
    updateCanvasUI(canvasManager);
}

function loadUIDefault(){
    console.log("Loading default UI");
    let defaultHTML = `
    <canvas id="canvas"></canvas>
    <div id="confirmation-modal" style="display:none;">
    </div>
    
    <div id="control-buttons">
      <button class="node-add-sub-buttons" id="add-node">+</button>
      <button class="node-add-sub-buttons" id="remove-node">-</button>
    </div>
    <div id="node-details">
      <button id="toggle-node-details">+</button>
      <div id="node-details-content">
        <div id="node-details-content-dynamic"></div>
        <div id="node-details-content-static"></div>
      </div>
    </div>
    <div id="canvas-details">
      <div id="canvas-details-content"></div>
      <button id="toggle-canvas-details">+</button>
    </div>`;
    document.body.innerHTML = defaultHTML;
}

export { loadUI, updateUI };