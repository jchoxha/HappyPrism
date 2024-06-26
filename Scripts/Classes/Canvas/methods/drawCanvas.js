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
    if (canvasManager.IM1selectedNodes.length > 0) {
        if (canvasManager.IM1selectedNodes.length > 1) {
            canvasManager.IM1selectedNodes.forEach(node => drawNodeBoundingBox(canvasManager, node));
            drawBoundingBoxAroundSelectedNodes(canvasManager);
        }
        else {
            drawNodeBoundingBox(canvasManager, canvasManager.IM1selectedNodes[0]);
        }
    }
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
        if (width < 0) {
            startX += width;
            width = -width;
        }
        if (height < 0) {
            startY += height;
            height = -height;
        }

        if (canvasManager.IM3shapeType === "elipse") {
            drawElipse(canvasManager, startX + width / 2, startY + height / 2, width, height, canvasManager.IM3shapeFillColor, canvasManager.IM3shapeStrokeWidth * canvasManager.scale, canvasManager.IM3shapeStrokeColor);
        }
        if (canvasManager.IM3shapeType === "rectangle") {
            drawPolygon(canvasManager, startX, startY, width, height, canvasManager.IM3shapeFillColor, canvasManager.IM3shapeStrokeWidth * canvasManager.scale, canvasManager.IM3shapeStrokeColor);
        }
    }
}

function drawElipse(canvasManager, x, y, width, height, fillColor = "white", strokeWidth = 0, strokeColor = null) {
    const ctx = canvasManager.ctx;

    // Adjust coordinates for negative width/height
    
    ctx.beginPath();
    ctx.ellipse(x, y, width / 2, height / 2, 0, 0, 2 * Math.PI);
    if (strokeWidth > 0) {
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = strokeColor;
        ctx.stroke();
    }
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
}

function drawRectangle(canvasManager, x, y, width, height, fillColor = "white", strokeWidth = 0, strokeColor = null) {
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

function drawTempNodeBoundingBox(canvasManager, node) {
    const ctx = canvasManager.ctx;
    ctx.save();

    ctx.strokeStyle = 'lightblue';
    ctx.lineWidth = 2;

    if (node.shapeType == 'elipse') {
        const x = node.x * canvasManager.scale + canvasManager.translateX;
        const y = node.y * canvasManager.scale + canvasManager.translateY;
        const width = node.shapeWidth * canvasManager.scale;
        const height = node.shapeHeight * canvasManager.scale;

        ctx.beginPath();
        ctx.rect(x - width / 2, y - height / 2, width, height);
        ctx.stroke();
    }

    ctx.restore();
}

function drawNodeBoundingBox(canvasManager, node) {
    const ctx = canvasManager.ctx;
    ctx.save();

    ctx.strokeStyle = 'lightblue';
    ctx.lineWidth = 2;

    if (node.shapeType == 'elipse') {
        const x = node.x;
        const y = node.y;
        const width = node.shapeWidth;
        const height = node.shapeHeight;

        ctx.beginPath();
        ctx.rect(x - width / 2, y - height / 2, width, height);
        ctx.stroke();
    }

    ctx.restore();
}

function drawBoundingBoxAroundSelectedNodes(canvasManager) {
    const nodes = canvasManager.IM1selectedNodes;
    if (nodes.length === 0) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    nodes.forEach(node => {
        const x = node.x;
        const y = node.y;
        const width = node.shapeWidth;
        const height = node.shapeHeight;

        minX = Math.min(minX, x - width / 2);
        minY = Math.min(minY, y - height / 2);
        maxX = Math.max(maxX, x + width / 2);
        maxY = Math.max(maxY, y + height / 2);
    });

    const ctx = canvasManager.ctx;
    ctx.save();
    ctx.strokeStyle = 'lightblue';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(minX, minY, maxX - minX, maxY - minY);
    ctx.stroke();
    ctx.restore();
}

function drawTempBoundingBoxAroundSelectedNodes(canvasManager) {
    const nodes = canvasManager.IM1selectionBoxDetectedNodes;
    if (nodes.length === 0) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    nodes.forEach(node => {
        const x = node.x * canvasManager.scale + canvasManager.translateX;
        const y = node.y * canvasManager.scale + canvasManager.translateY;
        const width = node.shapeWidth * canvasManager.scale;
        const height = node.shapeHeight * canvasManager.scale;

        minX = Math.min(minX, x - width / 2);
        minY = Math.min(minY, y - height / 2);
        maxX = Math.max(maxX, x + width / 2);
        maxY = Math.max(maxY, y + height / 2);
    });

    const ctx = canvasManager.ctx;
    ctx.save();
    ctx.strokeStyle = 'lightblue';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(minX, minY, maxX - minX, maxY - minY);
    ctx.stroke();
    ctx.restore();
}

export { drawCanvas, drawTemporaryShape, drawTempNodeBoundingBox, drawTempBoundingBoxAroundSelectedNodes}