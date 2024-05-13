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


        //Display Objects Over Canvas
        this.toggleNodeDetails = false;
        this.nodeDetailsStaticContentInit = false; //Are we done initializing the static content?

        this.toggleCanvasDetails = false;

        this.theme = null;
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
        this.draw(); // Redraw after resizing
    }


    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.translate(this.translateX, this.translateY); // Center the canvas
        this.ctx.scale(this.scale, this.scale); // Apply current scale
        this.updateCanvasRange()
        this.nodes.forEach(node => this.drawNode(node));
        if (this.highlightedNode) {
            if (this.toggleNodeDetails){
                this.drawNodeDetails(this.highlightedNode);
            }
            else{this.drawNodeDetails();}
        }
        else{
            this.drawNodeDetails();
        }
        this.ctx.restore();
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

    drawNodeDetails(node = null) {
        //Default Values
        let toggleNodeDetails  = "+";
        let nodeDetailsContentDynamic  = "";
        let nodeDetailsContentStatic  = "";

        //If we want to see the node details and have highlighted a node
        if (this.toggleNodeDetails && node) {
            //Set and print the dynamic values
            toggleNodeDetails = "-";
            nodeDetailsContentDynamic = `
                ID: ${node.id}<br>
                X: ${Math.round(node.x)}<br>
                Y: ${Math.round(node.y)}<br>
                Size: ${node.size}<br>
                Shape: ${node.shapeType.name}<br>
                
            `;
            document.getElementById('node-details-content-dynamic').innerHTML = nodeDetailsContentDynamic;

            //If we have not yet initialized the static content
            if(!this.nodeDetailsStaticContentInit){
                console.log("Redrawing static content");
                this.nodeDetailsStaticContentInit = true;

                //Set value for color picker, should equal nodes current color.


                nodeDetailsContentStatic = `
                    <button id="toggle-node-position-fixed">${node.positionFixed ? "Unfix Position" : "Fix Position"}</button><br>
                    Fill color: <input id ="node-color-picker" value="${node.fill}" data-jscolor="{preset:'small dark', position:'right'}"> `;

                document.getElementById('node-details-content-static').innerHTML = nodeDetailsContentStatic;



                //Add any event listeners to the static content 
                const positionToggleButton = document.getElementById('toggle-node-position-fixed');
                positionToggleButton.onclick = () => {
                    node.positionFixed = !node.positionFixed;
                    positionToggleButton.textContent = node.positionFixed ? "Unfix Position" : "Fix Position";
                    this.nodeDetailsStaticContentInit = false;
                };

                const nodeColorPicker = document.getElementById('node-color-picker');
                new jscolor(nodeColorPicker);
                nodeColorPicker.addEventListener('input', function() {
                    node.fill = nodeColorPicker.value;
                    this.nodeDetailsStaticContentInit = false;
                });
            }
        }
        //If we do not want to see the node details and/or we do not have highlighted a node
        else {
            this.toggleNodeDetails = false;
            this.nodeDetailsStaticContentInit = false;
            document.getElementById('node-details-content-dynamic').innerHTML = "";
            document.getElementById('node-details-content-static').innerHTML = "";
        }
        //Set the minimize / maximize button based on the final state of the menu
        document.getElementById('toggle-node-details').innerHTML = toggleNodeDetails;
    }
    
    drawCanvasDetails() {
        let toggleCanvasDetails = "+";
        let canvasDetailsContent = "";
        if (this.toggleCanvasDetails){
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
                X: ${this.mousePositionOnDrag.x.toFixed(0)}<br>
                Y: ${this.mousePositionOnDrag.y.toFixed(0)}<br>

                <br>View Range:<br>
                X: ${Math.round(this.topLeftX.toFixed(0))} to ${Math.round(this.bottomRightX.toFixed(2))}<br>
                Y: ${Math.round(this.topLeftY.toFixed(0))} to ${Math.round(this.bottomRightY.toFixed(2))}`;
        }
        document.getElementById('toggle-canvas-details').innerHTML = toggleCanvasDetails;
        document.getElementById('canvas-details-content').innerHTML = canvasDetailsContent;
    }
}

export { CanvasManager };
