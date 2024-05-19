// canvasManager.js
import { Node } from './nodes.js';
import { ShapeType } from './shapes.js';
import { nearestMultiple } from './utils.js';

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
        this.toggleOrbitDetails = false;
        this.nodeDetailsStaticContentInit = false;
        this.toggleCanvasDetails = false;
        this.theme = null;
        this.currentTime = Date.now();
        this.changeCentralNodeMode = false;
        this.nodeToChangeCentralNode = null;
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
        this.toggleOrbitDetails = false;
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
                if (!node.inOrbit) {
                    nodeDetailsContentStatic += `<button id="toggle-node-position-fixed">${node.positionFixed ? "Unfix Position" : "Fix Position"}</button><br>`;
                } else {
                    nodeDetailsContentStatic += `<button id="toggle-node-position-fixed" disabled> Position Fixed While in Orbit </button><br>`;
                }
                nodeDetailsContentStatic += `Fill color: <input id ="node-color-picker" value="${node.fill}" data-jscolor="{preset:'small dark', position:'right'}" onclick="this.blur();"><br> `;

                const buttonText = node.orbits.length === 1 ? "Modify Orbit" : "Modify Orbits";
                nodeDetailsContentStatic += `<button id="modify-orbits">${buttonText}</button><br>`;

                document.getElementById('node-details-content-static').innerHTML = nodeDetailsContentStatic;

                const nodeSizeRange = document.getElementById('node-size-range');
                nodeSizeRange.addEventListener('input', function () {
                    node.isResizing = true;
                    node.size = Number(nodeSizeRange.value);
                    node.orbits.forEach((orbit, index) => {
                        orbit.radius = node.size * orbit.radiusMult * (index + 1);
                    });
                    this.nodeDetailsStaticContentInit = false;
                });
                nodeSizeRange.addEventListener('mouseout', function () {
                    node.isResizing = false;
                });

                const positionToggleButton = document.getElementById('toggle-node-position-fixed');
                positionToggleButton.onclick = () => {
                    if (!node.inOrbit) {
                        node.positionFixed = !node.positionFixed;
                        if (node.positionFixed) {
                            node.fixedX = node.x;
                            node.fixedY = node.y;
                        }
                        positionToggleButton.textContent = node.positionFixed ? "Unfix Position" : "Fix Position";
                        this.nodeDetailsStaticContentInit = false;
                    }
                };

                const modifyOrbitsButton = document.getElementById('modify-orbits');
                if (modifyOrbitsButton) {
                    modifyOrbitsButton.addEventListener('click', () => {
                        this.toggleOrbitDetails = !this.toggleOrbitDetails;
                        if (this.toggleOrbitDetails) {
                            this.drawOrbitDetails(node);
                        } else {
                            this.drawOrbitDetails();
                        }
                    });
                }

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
            document.getElementById('orbit-details-menu').innerHTML = "";
            document.getElementById('node-details-content-static').innerHTML = "";
        }

        document.getElementById('toggle-node-details').innerHTML = toggleNodeDetails;
    }

    drawOrbitDetails(node) {
        const orbitDetailsMenu = document.getElementById('orbit-details-menu');
        if (node != null) {
            let orbitDetailsContent = `<h3>Orbit Menu</h3>`;

            if (!node.inOrbit) {
                orbitDetailsContent += `<h4>Current Orbit:</h4>`;
                orbitDetailsContent += `Currently not in an orbit<br>`;
                orbitDetailsContent += `<button id="change-central-node" class="orbit-menu-buttons">Change</button>`;
            } else {
                orbitDetailsContent += `<h4>Current Orbit:</h4>`;
                orbitDetailsContent += `Central Node: ${node.centralNode.name}<br>`;
                orbitDetailsContent += `<button id="change-central-node" class="orbit-menu-buttons">Change</button>`;
            }

            if (node.orbits.length <= 0) {
                orbitDetailsContent += `<h4>Orbiting this node:</h4>`;
                orbitDetailsContent += `No nodes are orbiting this node<br>`;
                orbitDetailsContent += `<button id="add-orbit" class="orbit-menu-buttons">+</button>`;
            } else {
                orbitDetailsContent += `<h4>Orbiting this node:</h4>`;
                orbitDetailsContent += `<button id="add-orbit-button" class="orbit-menu-buttons" >+</button>`;
                node.orbits.forEach((orbit, index) => {
                    orbitDetailsContent += `<h5>Orbit ${index + 1}</h5>`;
                    orbitDetailsContent += `<button class="remove-orbit-buttons orbit-menu-buttons" data-orbit-index="${index}">-</button>`;
                    orbitDetailsContent += `Radius: ${orbit.radius}<br>`;
                    orbitDetailsContent += `Angular Velocity: ${orbit.angularVelocity}<br>`;
                    orbitDetailsContent += `<div class="orbit-nodes"> Nodes in this orbit: `;

                    orbit.orbitingNodes.forEach(orbitingNode => {
                        orbitDetailsContent += `<div class="mini-node" data-node-id="${orbitingNode.id}" style="width: ${orbitingNode.size / 4}px; height: ${orbitingNode.size / 4}px; background: ${orbitingNode.fill}; border-radius: 50%;"></div>`;
                    });

                    orbitDetailsContent += `</div>`;
                });
            }

            orbitDetailsMenu.innerHTML = orbitDetailsContent;

            // Add event listeners to the miniature nodes
            const miniNodes = orbitDetailsMenu.querySelectorAll('.mini-node');
            miniNodes.forEach(miniNode => {
                miniNode.addEventListener('click', () => {
                    const nodeId = miniNode.getAttribute('data-node-id');
                    this.highlightNodeById(nodeId);
                });
            });

            // Add event listener for "Change" button
            const changeButton = document.getElementById('change-central-node');
            changeButton.addEventListener('click', () => {
                this.showChangeCentralNodeModal(node);
            });

            // Add event listener for "+" button
            const addOrbitButton = document.getElementById('add-orbit');
            if (addOrbitButton) {
                addOrbitButton.addEventListener('click', () => {
                    this.addOrbitToNode(node);
                });
            }

            // Add event listener for "-" buttons
            const removeOrbitButtons = orbitDetailsMenu.querySelectorAll('.remove-orbit-buttons');
            removeOrbitButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const orbitIndex = button.getAttribute('data-orbit-index');
                    this.removeOrbitFromNode(node, orbitIndex);
                });
            });
        } else {
            orbitDetailsMenu.innerHTML = "";
        }
    }

    showChangeCentralNodeModal(node) {
        const modalContent = `
            <div>
                <p>The next node you click will be the new central node for the selected node.</p>
                <button id="confirm-change-central-node">OK</button>
                <button id="cancel-change-central-node">Cancel</button>
            </div>
        `;

        const modal = document.getElementById('change-central-node-modal');
        modal.innerHTML = modalContent;
        modal.style.display = 'block';

        const closeModal = () => {
            modal.style.display = 'none';
            modal.innerHTML = '';
        };

        document.getElementById('cancel-change-central-node').onclick = closeModal;
        document.getElementById('confirm-change-central-node').onclick = () => {
            this.changeCentralNodeMode = true;
            this.nodeToChangeCentralNode = node;
            closeModal();
        };
    }

    changeCentralNode(node, newCentralNode) {
        if (node && newCentralNode) {
            if (node.currentOrbit) {
                const orbit = node.currentOrbit;
                const index = orbit.orbitingNodes.indexOf(node);
                if (index > -1) {
                    orbit.orbitingNodes.splice(index, 1);
                }
            }

            node.centralNode = newCentralNode;
            const newOrbit = newCentralNode.addOrbit(this);
            node.addSelfToOrbit(this, newCentralNode, newOrbit);

            this.draw();
        }
    }

    addOrbitToNode(node) {
        node.addOrbit(this);
        this.drawOrbitDetails(node);
        this.draw();
    }

    removeOrbitFromNode(node, orbitIndex) {
        const orbit = node.orbits[orbitIndex];
        if (orbit) {
            orbit.orbitingNodes.forEach(orbitingNode => {
                orbitingNode.inOrbit = false;
                orbitingNode.centralNode = null;
                orbitingNode.currentOrbit = null;
            });

            node.orbits.splice(orbitIndex, 1);
        }

        this.drawOrbitDetails(node);
        this.draw();
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
