import { Logger } from "../Debug/logger.js";
import { setUpNodeDetailsEvents } from "../Events/uiEvents.js";


function updateCanvasUI(canvasManager){
    //Set canvas details content
    setContentCanvasDetails(canvasManager)

    //set node details content
    if (canvasManager.highlightedNode && canvasManager.toggleNodeDetails) {
        setContentNodeDetails(canvasManager, canvasManager.highlightedNode);
    } else {
        setContentNodeDetails(canvasManager);
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
            
            setUpNodeDetailsEvents(canvasManager, node);

        }
    } else {
        canvasManager.toggleNodeDetails = false;
        canvasManager.nodeDetailsStaticContentInit = false;
        document.getElementById('node-details-content-dynamic').innerHTML = "";
        document.getElementById('node-details-content-static').innerHTML = "";
    }

    document.getElementById('toggle-node-details').innerHTML = toggleNodeDetails;
}

export { updateCanvasUI };