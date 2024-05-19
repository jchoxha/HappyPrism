// canvasManager.js
import { nearestMultiple } from '../Misc/utils.js';

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
        this.translateX = 0;
        this.translateY = 0;
        this.scale = 1;
        this.topLeftX = -(this.width / this.scale);
        this.topLeftY = (this.height / this.scale);
        this.bottomRightX = (this.width / this.scale);
        this.bottomRightY = -(this.height / this.scale);
        this.visibleWidth = this.bottomRightX - this.topLeftX;
        this.visibleHeight = this.bottomRightY - this.topLeftY;
        this.mousePositionOnDown = { x: 0, y: 0 };
        this.mousePositionOnUp = { x: 0, y: 0 };
        this.mousePositionOnMoveStart = { x: 0, y: 0 };
        this.mousePositionOnMoveLast = { x: 0, y: 0 };
        this.currentmousePos = { x: 0, y: 0 };
        this.currentmouseV = { x: 0, y: 0 };
        this.mouseLastMoveTime = null;
        this.mouseLastMovePos = { x: null, y: null };
        this.toggleNodeDetails = false;
        this.nodeDetailsStaticContentInit = false;
        this.toggleCanvasDetails = false;
        this.theme = null;
        this.currentTime = Date.now();
    }

    initCanvas(theme) {
        this.theme = theme;
        this.canvas.style.background = theme.canvas_background;
        this.resizeCanvas();
        window.addEventListener('resize', this.resizeCanvas.bind(this));
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.translateX = this.canvas.width / 2;
        this.translateY = this.canvas.height / 2;
        this.draw();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.translate(this.translateX, this.translateY);
        this.ctx.scale(this.scale, this.scale);
        if (this.topLeftY < 0 && this.bottomRightY > 0) {
            this.drawXAxis();
        }
        if (this.topLeftX < 0 && this.bottomRightX > 0) {
            this.drawYAxis();
        }
        let numNorthSouthLines = Math.floor(this.visibleWidth / 30);
        let numEastWestLines = Math.floor(this.visibleHeight / 30);
        let startPointX = nearestMultiple(this.topLeftX, 30);
        let startPointY = nearestMultiple(this.topLeftY, 30);

        for (let i = 0; i <= numNorthSouthLines; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(startPointX + i * 30, this.topLeftY);
            this.ctx.lineTo(startPointX + i * 30, this.bottomRightY);
            this.ctx.stroke();
        }
        for (let i = 0; i <= numEastWestLines; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.topLeftX, startPointY + i * 30);
            this.ctx.lineTo(this.bottomRightX, startPointY + i * 30);
            this.ctx.stroke();
        }

        this.updateCanvasRange();
        this.nodes.forEach(node => this.drawNode(node));
        if (this.highlightedNode) {
            if (this.toggleNodeDetails) {
                this.drawNodeDetails(this.highlightedNode);
            } else {
                this.drawNodeDetails();
            }
        } else {
            this.drawNodeDetails();
        }
        this.ctx.restore();
        this.drawCanvasDetails();
    }

    updateCanvasRange() {
        this.topLeftX = -this.translateX / this.scale;
        this.topLeftY = -this.translateY / this.scale;
        this.bottomRightX = this.topLeftX + (this.canvas.width / this.scale);
        this.bottomRightY = this.topLeftY + (this.canvas.height / this.scale);
        this.visibleWidth = this.bottomRightX - this.topLeftX;
        this.visibleHeight = this.bottomRightY - this.topLeftY;
    }

    drawXAxis() {
        const { width, height, topLeftX, bottomRightX, ctx } = this;

        ctx.save();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(topLeftX, 0);
        ctx.lineTo(bottomRightX, 0);
        ctx.stroke();
        ctx.restore();
    }

    drawYAxis() {
        const { topLeftY, bottomRightY, ctx } = this;

        ctx.save();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(0, topLeftY);
        ctx.lineTo(0, bottomRightY);
        ctx.stroke();
        ctx.restore();
    }

    drawNode(node) {
        const { x, y, size } = node;
        const radius = size / 2;
        this.ctx.beginPath();
        if (node.shapeType.name === 'circle') {
            this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        } else if (node.shapeType.isPolygon) {
            this.drawPolygon(x, y, node.shapeType.numSides, radius);
        } else {
            console.error('Cannot draw unknown shape type:', node.shapeType.name);
        }
        this.ctx.closePath();
        if (node.fillStyle === "solidColor") {
            this.ctx.fillStyle = node.fill;
            this.ctx.fill();
        } else {
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

    drawNodeDetails(node = null) {
        let toggleNodeDetails = "+";
        let nodeDetailsContentDynamic = "";
        let nodeDetailsContentStatic = "";

        if (this.toggleNodeDetails && node) {
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

            if (!this.nodeDetailsStaticContentInit) {
                this.nodeDetailsStaticContentInit = true;

                nodeDetailsContentStatic = `<input type="range" min="30" max="500" value="${node.size}" id="node-size-range"><br>`;
                nodeDetailsContentStatic += `<button id="toggle-node-position-fixed">${node.positionFixed ? "Unfix Position" : "Fix Position"}</button><br>`;
                nodeDetailsContentStatic += `Fill color: <input id ="node-color-picker" value="${node.fill}" data-jscolor="{preset:'small dark', position:'right'}" onclick="this.blur();"><br> `;
                
                document.getElementById('node-details-content-static').innerHTML = nodeDetailsContentStatic;

                const nodeSizeRange = document.getElementById('node-size-range');
                nodeSizeRange.addEventListener('input', function () {
                    node.isResizing = true;
                    node.size = Number(nodeSizeRange.value);
                    this.nodeDetailsStaticContentInit = false;
                });
                nodeSizeRange.addEventListener('mouseout', function () {
                    node.isResizing = false;
                });

                const positionToggleButton = document.getElementById('toggle-node-position-fixed');
                positionToggleButton.onclick = () => {
                    node.positionFixed = !node.positionFixed;
                    if (node.positionFixed) {
                        node.fixedX = node.x;
                        node.fixedY = node.y;
                        positionToggleButton.textContent = node.positionFixed ? "Unfix Position" : "Fix Position";
                        this.nodeDetailsStaticContentInit = false;
                    }
                };
                const nodeColorPicker = document.getElementById('node-color-picker');
                new jscolor(nodeColorPicker);
                nodeColorPicker.addEventListener('input', function () {
                    node.fill = nodeColorPicker.value;
                    this.nodeDetailsStaticContentInit = false;
                });

            }
        } else {
            this.toggleNodeDetails = false;
            this.nodeDetailsStaticContentInit = false;
            document.getElementById('node-details-content-dynamic').innerHTML = "";
            document.getElementById('node-details-content-static').innerHTML = "";
        }

        document.getElementById('toggle-node-details').innerHTML = toggleNodeDetails;
    }

    highlightNodeById(nodeId) {
        const node = this.nodes.find(node => node.id === nodeId);
        if (node) {
            this.highlightedNode = node;
            this.draw();
        }
    }

    drawCanvasDetails() {
        let toggleCanvasDetails = "+";
        let canvasDetailsContent = "";
        if (this.toggleCanvasDetails) {
            toggleCanvasDetails = "-";
            canvasDetailsContent =
                `Canvas Details:<br>
                Width: ${this.canvas.width}<br>
                Height: ${this.canvas.height}<br>
                xCenter: ${this.xCenter}<br>
                yCenter: ${this.yCenter}<br>
                Scale: ${this.scale.toFixed(2)}<br>
                TranslateX: ${this.translateX.toFixed(0)}<br>
                TranslateY: ${this.translateY.toFixed(0)}<br>
                <br>Current Mouse Coords:<br>
                X: ${this.currentmousePos.x.toFixed(0)}<br>
                Y: ${this.currentmousePos.y.toFixed(0)}<br>
                <br>Mouse Down Coords:<br>
                X: ${this.mousePositionOnDown.x.toFixed(0)}<br>
                Y: ${this.mousePositionOnDown.y.toFixed(0)}<br>
                <br>Mouse Up Coords:<br>
                X: ${this.mousePositionOnUp.x.toFixed(0)}<br>
                Y: ${this.mousePositionOnUp.y.toFixed(0)}<br>
                <br>Mouse Drag Coords:<br>
                X: ${this.mousePositionOnMoveStart.x.toFixed(0)}<br>
                Y: ${this.mousePositionOnMoveStart.y.toFixed(0)}<br>
                <br>View Range:<br>
                X: ${Math.round(this.topLeftX.toFixed(0))} to ${Math.round(this.bottomRightX.toFixed(2))}<br>
                Y: ${Math.round(this.topLeftY.toFixed(0))} to ${Math.round(this.bottomRightY.toFixed(2))}`;
        }
        document.getElementById('toggle-canvas-details').innerHTML = toggleCanvasDetails;
        document.getElementById('canvas-details-content').innerHTML = canvasDetailsContent;
    }
}

export { CanvasManager };
