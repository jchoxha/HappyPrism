// nodes.js
import { ShapeType } from './shapes.js';
import { CanvasManager } from './canvasManager.js';

//Global Node Properties

const radiusMult = 2; //node.size x this = radius

class Node {
    constructor(x, y, size, shapeType, fill="black", parent=null, children=[]) {
        this.id = generateUUID();
        this.x = x;
        this.y = y;
        this.size = size;
        this.radius = size * radiusMult;
        this.vx = 0;
        this.vy = 0;
        this.angle = 0;
        this.intendedAngle = 0;
        this.refAngle = 0;
        this.dragging = false;
        this.shapeType = shapeType;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        this.parent = parent;
        this.children = children;
        
        if (fill =="randomColor"){
            this.fill = getRandomColor();
            this.fillStyle = "solidColor";
        }
        else if (isValidColor(fill)) {
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
function getRandomColor() {
    // Generates a random integer between 0 and 255 for each color component
    const red = Math.floor(Math.random() * 256);
    const green = Math.floor(Math.random() * 256);
    const blue = Math.floor(Math.random() * 256);

    // Constructs a CSS color string in the format "rgb(r, g, b)"
    return `rgb(${red}, ${green}, ${blue})`;
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
    console.log("adding node");
    let angularSeparation = 0;
    if (newNode.parent) {
        const children = newNode.parent.children;
        angularSeparation = 2 * Math.PI / (newNode.parent.children.length + 1);  // Include new node in count
        newNode.intendedAngle = newNode.parent.angle + angularSeparation * children.length;
        newNode.angle = newNode.intendedAngle;  // Initially set to intended angle for a smooth start

        // Set initial position relative to parent using the intended angle
        newNode.x = newNode.parent.x + newNode.radius * Math.cos(newNode.angle);
        newNode.y = newNode.parent.y + newNode.radius * Math.sin(newNode.angle);

        children.push(newNode);  // Add the new node to the parent's children array
    }
    
    nodes.push(newNode);  // Add to the main nodes array

    // Update angles for all siblings to ensure smooth transitions
    if (newNode.parent) {
        newNode.parent.children.forEach((child, index) => {
            angularSeparation = 2 * Math.PI / (child.parent.children.length); 
            const newAngle = newNode.parent.angle + angularSeparation * index;
            child.intendedAngle = newAngle;
            // Do not instantly set 'child.angle' to 'newAngle' to avoid jumps
        });
    }
    return nodes;
}



function removeNode(nodes, nodeToRemove) {
    // Helper function to recursively remove a node and its children
    function recursiveRemove(node) {
        // Recursively remove all children
        node.children.slice().forEach(child => recursiveRemove(child));
        // Remove the node from its parent's children array if it has a parent
        if (node.parent) {
            const childIndex = node.parent.children.indexOf(node);
            if (childIndex > -1) {
                node.parent.children.splice(childIndex, 1);
            }
        }
        // Remove the node from the main array
        const index = nodes.indexOf(node);
        if (index > -1) {
            nodes.splice(index, 1);
        }
    }

    // Start recursive removal
    recursiveRemove(nodeToRemove);
}

function removeOnlyParent(nodes, nodeToRemove) {
    // Nullify the parent property of all children and make them independent
    nodeToRemove.children.forEach(child => {
        child.parent = null;  // Remove the parent link
        // Reset movement properties that may depend on the parent
        child.vx = 0;
        child.vy = 0;
        child.angle = 0;
        child.intendedAngle = 0;
        child.refAngle = 0;
    });

    // Remove the node from its parent's children array if it has a parent
    if (nodeToRemove.parent) {
        const childIndex = nodeToRemove.parent.children.indexOf(nodeToRemove);
        if (childIndex > -1) {
            nodeToRemove.parent.children.splice(childIndex, 1);
        }
    }

    // Remove the node from the main nodes array
    const index = nodes.indexOf(nodeToRemove);
    if (index > -1) {
        nodes.splice(index, 1);
    }
}

function updateNodes(nodes) {
    nodes.forEach(node => {
        if (node.parent) {
            const children = node.parent.children;
            const index = children.indexOf(node); // Get the index of the node in the parent's children array
            const angularSeparation = 2 * Math.PI / children.length; // Divide the circle based on the number of siblings

            node.refAngle = node.parent.angle + angularSeparation * index; // Offset by parent's angle for nested orbiting
            node.angle = node.refAngle; // Sync the reference angle with the current angle if needed

            // Calculate the new position based on the parent's position
            node.x = node.parent.x + node.parent.radius * Math.cos(node.angle); 
            node.y = node.parent.y + node.parent.radius * Math.sin(node.angle);
        }
    });
}

export { Node, addNode, removeNode, removeOnlyParent };