// canvasManager.js
import { Node} from './nodes.js';
import { ShapeType } from './shapes.js';

class CanvasManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.selectedNode = null;
        this.centralNode = new Node(this.canvas.width / 2, this.canvas.height / 2, 100, ShapeType.SQUARE); 
        this.initCanvas();
    }

    initCanvas() {
        this.canvas.style.background = "lightgrey"; 
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centralNode.x = this.canvas.width / 2;
        this.centralNode.y = this.canvas.height / 2;
        this.draw();  // Redraw after resizing
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawNode(this.centralNode);
        this.nodes.forEach(node => this.drawNode(node));
        if (this.selectedNode) {
            this.drawNodeDetails(this.selectedNode);
        }
    }

    drawNode(node) {
        const { x, y, size } = node;
        const radius = size / 2;
        this.ctx.beginPath();
        if (node.shapeType.name === 'circle') {
            this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        } else if (node.shapeType.isPolygon){
            this.drawPolygon(x, y, node.shapeType.numSides, radius);
        }
        else {
            console.error('Cannot draw unknown shape type:', node.shapeType.name);
        }
        this.ctx.closePath();
        if (node.fillStyle === "solidColor") {
            this.ctx.fillStyle = node.fill;
            this.ctx.fill();
        }
        else {
            console.error("No fill style found for node, using black instead");
            this.ctx.fillStyle = "black";
            this.ctx.stroke();
        }
    }

    drawPolygon(x, y, numSides, radius) {
        this.ctx.moveTo(x + radius, y);
        for (let i = 1; i <= numSides; i++) {
            this.ctx.lineTo(x + radius * Math.cos(2 * Math.PI * i / numSides), y + radius * Math.sin(2 * Math.PI * i / numSides));
        }
    }

    drawNodeDetails(node) {
        this.ctx.font = "16px Arial";
        this.ctx.fillStyle = "black";
        this.ctx.fillText(`ID: ${node.id}`, 10, 30);
        this.ctx.fillText(`X: ${node.x}`, 10, 50);
        this.ctx.fillText(`Y: ${node.y}`, 10, 70);
        this.ctx.fillText(`Size: ${node.size}`, 10, 90);
        this.ctx.fillText(`Shape: ${node.shapeType.name}`, 10, 110);
        this.ctx.fillText(`vx: ${node.vx}`, 10, 130);
        this.ctx.fillText(`vy: ${node.vy}`, 10, 150);
        this.ctx.fillText(`angle: ${node.angle}`, 10, 170);
        this.ctx.fillText(`refAngle: ${node.refAngle}`, 10, 190);
        this.ctx.fillText(`Dragging: ${node.dragging}`, 10, 210);
        this.ctx.fillText(`dragOffsetX: ${node.dragOffsetX}`, 10, 230);
        this.ctx.fillText(`dragOffsetY: ${node.dragOffsetY}`, 10, 250);
    }
}

export { CanvasManager };
