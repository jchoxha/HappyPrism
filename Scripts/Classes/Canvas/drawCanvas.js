import { Logger } from '../../Debug/logger.js';
import { nearestMultiple } from '../../Misc/utils.js';

const gridInterval = 30;

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
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;

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
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, topLeftY);
    ctx.lineTo(0, bottomRightY);
    ctx.stroke();
    ctx.restore();
}

function drawNode(canvasManager, node) {
    const { x, y, size } = node;
    const radius = size / 2;
    canvasManager.ctx.beginPath();
    if (node.shapeType.name === 'circle') {
        canvasManager.ctx.arc(x, y, radius, 0, 2 * Math.PI);
    } else if (node.shapeType.isPolygon) {
        drawPolygon(canvasManager, x, y, node.shapeType.numSides, radius);
    } else {
        Logger.error('Cannot draw unknown shape type:', node.shapeType.name);
    }
    canvasManager.ctx.closePath();
    if (node.fillStyle === "solidColor") {
        canvasManager.ctx.fillStyle = node.fill;
        canvasManager.ctx.fill();
    } else {
        Logger.error("No fill style found for node, using black instead");
        canvasManager.ctx.fillStyle = "black";
        canvasManager.ctx.stroke();
    }
}

function drawPolygon(canvasManager, x, y, numSides, radius) {
    canvasManager.ctx.moveTo(x + radius, y);
    for (let i = 1; i <= numSides; i++) {
        canvasManager.ctx.lineTo(x + radius * Math.cos(2 * Math.PI * i / numSides), y + radius * Math.sin(2 * Math.PI * i / numSides));
    }
}

export { drawCanvas }