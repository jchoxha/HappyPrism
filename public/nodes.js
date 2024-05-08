// nodes.js
import { ShapeType } from './shapes.js';
import { CanvasManager } from './canvasManager.js';

class Node {
    constructor(x, y, size, shapeType, fill="black", parent=null, children=[]) {
        this.id = generateUUID();
        this.x = x;
        this.y = y;
        this.size = size;
        this.vx = 0;
        this.vy = 0;
        this.angle = 0;
        this.refAngle = 0;
        this.dragging = false;
        this.shapeType = shapeType;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        this.parent = parent;
        this.children = children;
        
        if (isValidColor(fill)) {
            this.fill = fill;
            this.fillStyle = "solidColor";
        }
        else {
            console.error('Invalid color: $fill, using black instead');
            this.fill = 'black';
            this.fillStyle = "solidColor";
        }

        if (this.parent !== null && this.parent instanceof Node && Array.isArray(this.parent.children)) {
            this.parent.children.push(this);
        } else if (this.parent) {
            console.error('Invalid parent node provided');
        }
        
    }
}

function generateUUID() {
    return crypto.randomUUID();
}

function isValidColor(strColor) {
    var s = new Option().style;
    s.color = strColor;
    strColor.toLowerCase();

    // return 'false' if color wasn't assigned
    return s.color == strColor
  }

function addNode(nodes, newNode) {
    nodes.push(newNode);
    updateNodes(nodes);
    return nodes;
}

function removeNode(nodes) {
    if (nodes.length > 0) {
        nodes.pop();
    }
    updateNodes(nodes);
    return nodes;
}

function updateNodes(nodes) {
    const angularSeparation = 2 * Math.PI / (nodes.length);
    nodes.forEach((node, index) => {
        node.angle = angularSeparation * index;
        node.refAngle = angularSeparation * index;
    });
}

export { Node, addNode, removeNode };