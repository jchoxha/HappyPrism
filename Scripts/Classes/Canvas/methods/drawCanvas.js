import { Logger } from '../../../Debug/logger.js';
import { getRandomColor } from '../../../Misc/colors.js';
import { nearestMultiple } from '../../../Misc/utils.js';

function drawCanvas(canvasManager) {
    canvasManager.ctx.clearRect(0, 0, canvasManager.canvas.width, canvasManager.canvas.height);
    canvasManager.ctx.save();
    canvasManager.ctx.translate(canvasManager.translateX, canvasManager.translateY);
    canvasManager.ctx.scale(canvasManager.scale, canvasManager.scale);
    drawGrid(canvasManager);
    canvasManager.nodes.forEach(node => drawNode(canvasManager, node));
    canvasManager.ctx.restore();
}

function drawGrid(canvasManager) {

    const gridInterval = canvasManager.gridInterval;

    if (canvasManager.topLeftY < 0 && canvasManager.bottomRightY > 0) {
        drawXAxis(canvasManager);
    }
    if (canvasManager.topLeftX < 0 && canvasManager.bottomRightX > 0) {
        drawYAxis(canvasManager);
    }
    let numNorthSouthLines = Math.floor(canvasManager.visibleWidth / gridInterval);
    let numEastWestLines = Math.floor(canvasManager.visibleHeight / gridInterval);
    let startPointX = nearestMultiple(canvasManager.topLeftX, gridInterval);
    let startPointY = nearestMultiple(canvasManager.topLeftY, gridInterval);

    canvasManager.ctx.strokeStyle = canvasManager.gridColor;
    canvasManager.ctx.lineWidth = 2;
    for (let i = 0; i <= numNorthSouthLines; i++) {
        canvasManager.ctx.beginPath();
        canvasManager.ctx.moveTo(startPointX + i * gridInterval, canvasManager.topLeftY);
        canvasManager.ctx.lineTo(startPointX + i * gridInterval, canvasManager.bottomRightY);
        canvasManager.ctx.stroke();
    }
    for (let i = 0; i <= numEastWestLines; i++) {
        canvasManager.ctx.beginPath();
        canvasManager.ctx.moveTo(canvasManager.topLeftX, startPointY + i * gridInterval);
        canvasManager.ctx.lineTo(canvasManager.bottomRightX, startPointY + i * gridInterval);
        canvasManager.ctx.stroke();
    }
}

function drawXAxis(canvasManager) {
    const topLeftX = canvasManager.topLeftX;
    const bottomRightX =canvasManager.bottomRightX;
    const ctx = canvasManager.ctx;
    ctx.save();
    ctx.strokeStyle = canvasManager.gridColor;
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(topLeftX, 0);
    ctx.lineTo(bottomRightX, 0);
    ctx.stroke();
    ctx.restore();
}

function drawYAxis(canvasManager) {
    const topLeftY = canvasManager.topLeftY;
    const bottomRightY =canvasManager.bottomRightY;
    const ctx = canvasManager.ctx;

    ctx.save();
    ctx.strokeStyle = canvasManager.gridColor;
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(0, topLeftY);
    ctx.lineTo(0, bottomRightY);
    ctx.stroke();
    ctx.restore();
}

function drawNode(canvasManager, node) {
    if (node.shapeType == 'elipse') {
        drawElipse(canvasManager, node.x, node.y, node.shapeWidth, node.shapeHeight, node.shapeFillColor, node.shapeStrokeWidth, node.shapeStrokeColor);
    }
}

function drawTemporaryShape(canvasManager) {
    console.log("Drawing temporary shape");
    const ctx = canvasManager.ctx;

    //We have to redraw the canvas each time this is called 
    //  so that the temporary shape is not drawn on top of the previous one
    drawCanvas(canvasManager);
    canvasManager.update();
    
    if (canvasManager.interactionMode == "selectCanvas") {
        const startX = canvasManager.IM1selectionBoxStartPos.x * canvasManager.scale + (canvasManager.translateX);
        const startY = canvasManager.IM1selectionBoxStartPos.y * canvasManager.scale+ (canvasManager.translateY);
        const width = (canvasManager.IM1selectionBoxEndPos.x * canvasManager.scale + (canvasManager.translateX) - startX);
        const height = (canvasManager.IM1selectionBoxEndPos.y * canvasManager.scale +(canvasManager.translateY) - startY);
        drawRectangle(canvasManager, startX, startY, width, height, "rgba(227, 227, 227, 0.5)", 1, "#898989");
        
    }
    if(canvasManager.interactionMode == "addShape"){
        let startX = canvasManager.IM3shapeStartPos.x * canvasManager.scale + (canvasManager.translateX);
        let startY = canvasManager.IM3shapeStartPos.y * canvasManager.scale + (canvasManager.translateY);
        let width = (canvasManager.IM3shapeEndPos.x * canvasManager.scale + (canvasManager.translateX) - startX);
        let height = (canvasManager.IM3shapeEndPos.y * canvasManager.scale + (canvasManager.translateY) - startY);
        if (width != 0 && height != 0) {
            canvasManager.IM3shapeDims = {x: startX, y: startY, width: width, height: height};
        }
        //If we just clicked instead of dragged with the add shape tool,
        //  we want to draw the shape centered on the click with
        //  the dimensions we have stored from the previous shape
        else if (!canvasManager.IM3draggingShape) {
            width = canvasManager.IM3shapeDims.width;
            height = canvasManager.IM3shapeDims.height;
            startX = (canvasManager.currentmousePos.x * canvasManager.scale + (canvasManager.translateX)) - width / 2;
            startY = (canvasManager.currentmousePos.y * canvasManager.scale+ (canvasManager.translateY)) - height / 2;
        }

        // Adjust coordinates for negative width/height
        if (width < 0) {
            startX += width;
            width = -width;
        }
        if (height < 0) {
            startY += height;
            height = -height;
        }

        if (canvasManager.IM3shapeType === "elipse") {
            drawElipse(canvasManager, startX + width / 2, startY + height / 2, width, height, canvasManager.IM3shapeFillColor, canvasManager.IM3shapeStrokeWidth, canvasManager.IM3shapeStrokeColor);
        }
        if (canvasManager.IM3shapeType === "rectangle") {
            drawPolygon(canvasManager, startX, startY, width, height, canvasManager.IM3shapeFillColor, canvasManager.IM3shapeStrokeWidth, canvasManager.IM3shapeStrokeColor);
        }
    }
}

function drawElipse(canvasManager, x, y, width, height, fillColor = "white", strokeWidth = 1, strokeColor = "black") {
    const ctx = canvasManager.ctx;

    // Adjust coordinates for negative width/height
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = strokeColor;
    ctx.beginPath();
    ctx.ellipse(x, y, width / 2, height / 2, 0, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
}

function drawRectangle(canvasManager, x, y, width, height, fillColor = "white", strokeWidth = 1, strokeColor = "black") {
    const ctx = canvasManager.ctx;
    ctx.moveTo(x, y);
    ctx.lineWidth = 1;
    ctx.strokeStyle = strokeColor;
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.stroke();
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
}

function drawPolygon(canvasManager, x, y, numSides, radius, fillColor = "white", strokeWidth = 1, strokeColor = "black") {
    const ctx = canvasManager.ctx;
    ctx.moveTo(x + radius, y);
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = strokeColor;
    for (let i = 1; i <= numSides; i++) {
        ctx.lineTo(x + radius * Math.cos(2 * Math.PI * i / numSides), y + radius * Math.sin(2 * Math.PI * i / numSides));
    }
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
}

export { drawCanvas, drawTemporaryShape }