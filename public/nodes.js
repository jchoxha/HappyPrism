// nodes.js
import { ShapeType } from './shapes.js';
import { CanvasManager } from './canvasManager.js';

//GLOBAL VARIABLES
const radiusMult = 2;

class Orbit {
  constructor(centralNode = null, orbitingNodes = null, radius = 0, angularVelocity = 0) {
    this.centralNode = centralNode;
    this.orbitingNodes = orbitingNodes;
    this.radius = radius;
    this.angularVelocity = angularVelocity;
  }

}

class Node {
  constructor(startingX, startingY, size, shapeType, fill = "randomColor", parent = null, children = [], startingOrbit = null) {
    this.name = "New Node";
    this.id = generateUUID();

    //Positioning
    this.x = this.intendedX = this.fixedX = startingX;
    this.y = this.intendedY = this.fixedY = startingY;

    //Node Sizing
    this.size = size;
    this.isResizing = false;

    //Physics
    this.mass = size;
    this.vx = this.vy = 0; // Velocity in X and 
    this.positionFixed = true;
    this.positionOnDragStart = { x: 0, y: 0 };
    this.dragOffsetX = this.dragOffsetY = 0;
    this.angle = this.intendedAngle = this.refAngle = 0;

    //Orbits
    this.centralNode = null;
    this.startingOrbit = null;
    this.inOrbit = false;
    if (startingOrbit) {
      this.inOrbit = true;
      this.positionFixed = false;
      this.currentOrbit = startingOrbit;
  }
    this.orbits = [];
    

    //Handle dragging
    this.dragging = this.inMovementAfterDragging = this.inMovementAfterCollision = false;

    //Node Parent and Children
    this.parent = parent;
    this.children = children;

    //Node Visuals
    this.shapeType = shapeType;
    this.fill = fill;
    this.setFillStyle(fill);
  }

  setFillStyle(fill) {
    if (fill === "randomColor") {
      this.fill = getRandomColor();
    } else if (isValidColor(fill)) {
      this.fill = fill;
    } else {
      console.error(`Invalid color: ${fill}, using black instead`);
      this.fill = 'black';
    }
    this.fillStyle = "solidColor";
  }

  addSelfToParent() {
    if (this.parent && this.parent instanceof Node && Array.isArray(this.parent.children)) {
      this.parent.children.push(this);
    } else if (this.parent) {
      console.error('Invalid parent node provided');
    }
  }
  
  addSelfToOrbit(centralNode, orbit) {
    if (orbit && orbit instanceof Orbit && Array.isArray(orbit.orbitingNodes)) {
      orbit.orbitingNodes.push(this);
      this.currentOrbit = orbit;
      this.centralNode = centralNode;
    } else if (orbit) {
      console.error('Invalid orbit provided');
    }
  }
  addOrbit() {

    let orbit = new Orbit(this, [], this.size * radiusMult * (this.orbits.length + 1), 0.01);
    this.orbits.push(orbit);
    return orbit;
  }
}

function getRandomColor() {
  const [red, green, blue] = Array.from({ length: 3 }, () => Math.floor(Math.random() * 256));
  return `rgba(${red},${green},${blue},1)`;
}

function generateUUID() {
  return crypto.randomUUID();
}

function isValidColor(strColor) {
  const style = new Option().style;
  style.color = strColor;
  return style.color === strColor.toLowerCase();
}

function addNode(canvasManager, newNodeParent = null) {
  if (!canvasManager.width || !canvasManager.height) {
    console.error('Canvas dimensions are not set!');
    return;
  }

  let startingSize = 50;
  let startingShapeType = ShapeType.CIRCLE;
  let startingFill = "randomColor";
  let startingPosition = canvasManager.mousePositionOnDown || { x: canvasManager.xCenter, y: canvasManager.yCenter };
  let startingOrbit = null;
  if(newNodeParent){
    startingSize = newNodeParent.size * 0.5;

    //Add to 1st orbit of parent by default
    if (!newNodeParent.orbits || !Array.isArray(newNodeParent.orbits)) {
      newNodeParent.orbits = [];
    }

    if (newNodeParent.orbits.length === 0) {
      newNodeParent.addOrbit();
    }
    startingPosition.y = newNodeParent.y - (newNodeParent.orbits[0].radius)
    startingOrbit = true;
  }
  const newNode = new Node(startingPosition.x, startingPosition.y, startingSize, startingShapeType, startingFill, newNodeParent, [], startingOrbit);
  
      newNode.positionFixed = false;

  if (newNodeParent) {
    if (newNode.inOrbit) {
      //Add to parent's first orbit by default
      newNode.addSelfToOrbit(newNodeParent, newNodeParent.orbits[0]);
    }
    newNode.addSelfToParent();
    updateChildNodesRefAngles(newNodeParent);
  }

  console.log("Adding node:", newNode);
  canvasManager.nodes.push(newNode);
  if(!canvasManager.toggleNodeDetails) {
    canvasManager.toggleNodeDetails = !canvasManager.toggleNodeDetails;
  }
  return newNode;
}

function updateChildNodesRefAngles(parentNode) {
  const children = parentNode.children;
  const angleStep = (2 * Math.PI) / children.length;

  children.forEach((child, index) => {
    child.refAngle = index * angleStep;
  });
}

function removeNode(nodes, nodeToRemove) {
  function recursiveRemove(node) {
    // Create a copy of the children array to avoid modification issues during iteration
    const childrenCopy = node.children.slice();
    childrenCopy.forEach(child => recursiveRemove(child));

    // Remove the node from its parent's children array
    const parentChildren = node.parent?.children;
    if (parentChildren) {
      const index = parentChildren.indexOf(node);
      if (index > -1) {
        parentChildren.splice(index, 1);
      }
    }

    // Remove the node from the main nodes array
    const nodeIndex = nodes.indexOf(node);
    if (nodeIndex > -1) {
      nodes.splice(nodeIndex, 1);
    }
  }

  recursiveRemove(nodeToRemove);
}

function removeOnlyParent(nodes, nodeToRemove) {
  nodeToRemove.children.forEach(child => {
    child.parent = null;
    child.inOrbit = false;
    child.intendedX = child.x;
    child.intendedY = child.y;
    child.angle = child.intendedAngle = child.refAngle = 0;
  });

  const parentChildren = nodeToRemove.parent?.children;
  if (parentChildren) {
    const index = parentChildren.indexOf(nodeToRemove);
    if (index > -1) {
      parentChildren.splice(index, 1);
    }
  }
  nodes.splice(nodes.indexOf(nodeToRemove), 1);
}


export { Node, addNode, removeNode, removeOnlyParent, updateChildNodesRefAngles };