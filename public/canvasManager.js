// canvasManager.js
import { Node} from './nodes.js';
import { ShapeType } from './shapes.js';

class CanvasManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        this.nodes = [];

        this.selectedNode = null;
        this.highlightedNode = null;

        this.draggingCanvas = false;
        

        
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.xCenter = 0;
        this.yCenter = 0;
        this.translateX = 0; // Added to track translation on X
        this.translateY = 0; // Added to track translation on Y
        this.scale = 1; 
        this.topLeftX = 0;
        this.topLeftY = 0;
        this.bottomRightX = 0;
        this.bottomRightY = 0;

        this.mousePositionOnDown = { x: 0, y: 0 };
        this.mousePositionOnUp = { x: 0, y: 0 };
        this.mousePositionOnDrag = { x: 0, y: 0 };
        this.currentmousePos = { x: 0, y: 0 };
        this.currentmouseV = { x: 0, y: 0 };

        //For mouse velocity
        this.mouseLastMoveTime = null;
        this.mouseLastMovePos = { x: null, y: null };

        this.initCanvas();
    }

    initCanvas() {
        this.canvas.style.background = "lightgrey";
        this.resizeCanvas();
        window.addEventListener('resize', this.resizeCanvas.bind(this));
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.translateX = this.canvas.width / 2;
        this.translateY = this.canvas.height / 2;
        this.draw(); // Redraw after resizing
    }


    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.translate(this.translateX, this.translateY); // Center the canvas
        this.ctx.scale(this.scale, this.scale); // Apply current scale

        this.nodes.forEach(node => this.drawNode(node));
        if (this.highlightedNode) {
            this.drawNodeDetails(this.highlightedNode);
        }
        this.ctx.restore();
        this.updateCanvasRange();
        this.drawCanvasDetails()
    }

    updateCanvasRange() {
        this.topLeftX = -this.translateX / this.scale;
        this.topLeftY = -this.translateY / this.scale;;
        this.bottomRightX = this.topLeftX + (this.canvas.width / this.scale);
        this.bottomRightY = this.topLeftY + (this.canvas.height / this.scale);
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
        let detailsHtml = `ID: ${node.id}<br>
                           X: ${node.x}<br>
                           Y: ${node.y}<br>
                           Size: ${node.size}<br>
                           Shape: ${node.shapeType.name}<br>`;
        document.getElementById('node-info').innerHTML = detailsHtml;
    }
    
    drawCanvasDetails() {
            
        const canvasDetailsText = 
                        `Canvas Details:<br>
                        Width: ${this.canvas.width}<br>
                        Height: ${this.canvas.height}<br>
                        xCenter: ${this.xCenter}<br>
                        yCenter: ${this.yCenter}<br>
                        Scale: ${this.scale}<br>
                        TranslateX: ${this.translateX}<br>
                        TranslateY: ${this.translateY}<br>

                        <br>Current Mouse Coords:<br>
                        X: ${this.currentmousePos.x.toFixed(2)}<br>
                        Y: ${this.currentmousePos.y.toFixed(2)}<br>
                        <br>Mouse Down Coords:<br>
                        X: ${this.mousePositionOnDown.x.toFixed(2)}<br>
                        Y: ${this.mousePositionOnDown.y.toFixed(2)}<br>
                        <br>Mouse Up Coords:<br>
                        X: ${this.mousePositionOnUp.x.toFixed(2)}<br>
                        Y: ${this.mousePositionOnUp.y.toFixed(2)}<br>
                        <br>Mouse Drag Coords:<br>
                        X: ${this.mousePositionOnDrag.x.toFixed(2)}<br>
                        Y: ${this.mousePositionOnDrag.y.toFixed(2)}<br>

                        <br>View Range:<br>
                        X: ${Math.round(this.topLeftX.toFixed(2))} to ${Math.round(this.bottomRightX.toFixed(2))}<br>
                        Y: ${Math.round(this.topLeftY.toFixed(2))} to ${Math.round(this.bottomRightY.toFixed(2))}`;
        document.getElementById('canvas-details').innerHTML = canvasDetailsText;
    }
}

export { CanvasManager };
