import { nearestMultiple } from '../../Misc/utils.js';

function drawCanvas(canvasManager) {
    canvasManager.ctx.clearRect(0, 0, canvasManager.canvas.width, canvasManager.canvas.height);
    canvasManager.ctx.save();
    canvasManager.ctx.translate(canvasManager.translateX, canvasManager.translateY);
    canvasManager.ctx.scale(canvasManager.scale, canvasManager.scale);
    if (canvasManager.topLeftY < 0 && canvasManager.bottomRightY > 0) {
        drawXAxis(canvasManager);
    }
    if (canvasManager.topLeftX < 0 && canvasManager.bottomRightX > 0) {
        drawYAxis(canvasManager);
    }
    let numNorthSouthLines = Math.floor(canvasManager.visibleWidth / 30);
    let numEastWestLines = Math.floor(canvasManager.visibleHeight / 30);
    let startPointX = nearestMultiple(canvasManager.topLeftX, 30);
    let startPointY = nearestMultiple(canvasManager.topLeftY, 30);

    for (let i = 0; i <= numNorthSouthLines; i++) {
        canvasManager.ctx.beginPath();
        canvasManager.ctx.moveTo(startPointX + i * 30, canvasManager.topLeftY);
        canvasManager.ctx.lineTo(startPointX + i * 30, canvasManager.bottomRightY);
        canvasManager.ctx.stroke();
    }
    for (let i = 0; i <= numEastWestLines; i++) {
        canvasManager.ctx.beginPath();
        canvasManager.ctx.moveTo(canvasManager.topLeftX, startPointY + i * 30);
        canvasManager.ctx.lineTo(canvasManager.bottomRightX, startPointY + i * 30);
        canvasManager.ctx.stroke();
    }
    canvasManager.nodes.forEach(node => drawNode(canvasManager, node));
    canvasManager.ctx.restore();
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
    const topLeftY = canvasManager.topLeftX;
    const bottomRightY =canvasManager.bottomRightX;
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
        console.error('Cannot draw unknown shape type:', node.shapeType.name);
    }
    canvasManager.ctx.closePath();
    if (node.fillStyle === "solidColor") {
        canvasManager.ctx.fillStyle = node.fill;
        canvasManager.ctx.fill();
    } else {
        console.error("No fill style found for node, using black instead");
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