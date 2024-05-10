// nodes.js
import { ShapeType } from './shapes.js';
import { CanvasManager } from './canvasManager.js';

const radiusMult = 2; // Multiplier for node size to calculate radius

class Node {
  constructor(startingX, startingY, size, shapeType, fill = "black", parent = null, children = []) {
    this.id = generateUUID();
    this.x = this.intendedX = startingX;
    this.y = this.intendedY = startingY;
    this.vx = this.vy = 0; // Velocity in X and Y
    this.size = size;
    this.radius = size * radiusMult;
    this.angle = this.intendedAngle = this.refAngle = 0;
    this.dragging = this.inMovementAfterDragging = this.inOrbit = false;
    this.positionOnDragStart = { x: 0, y: 0 };
    this.dragOffsetX = this.dragOffsetY = 0;
    this.parent = parent;
    this.children = children;
    this.shapeType = shapeType;

    this.setFillStyle(fill);
    this.addSelfToParent();
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
}

function getRandomColor() {
  const [red, green, blue] = Array.from({ length: 3 }, () => Math.floor(Math.random() * 256));
  return `rgb(${red}, ${green}, ${blue})`;
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

  const defaultSize = 50;
  const defaultShapeType = ShapeType.CIRCLE;
  const defaultFill = "randomColor";
  const startingPosition = canvasManager.mousePositionOnDown || { x: canvasManager.xCenter, y: canvasManager.yCenter };
  const newNode = new Node(startingPosition.x, startingPosition.y, defaultSize, defaultShapeType, defaultFill, newNodeParent);

  console.log("Adding node:", newNode);
  canvasManager.nodes.push(newNode);
  return newNode;
}

function removeNode(nodes, nodeToRemove) {
  function recursiveRemove(node) {
    node.children.forEach(recursiveRemove);
    const parentChildren = node.parent?.children;
    if (parentChildren) {
      const index = parentChildren.indexOf(node);
      if (index > -1) {
        parentChildren.splice(index, 1);
      }
    }
    nodes.splice(nodes.indexOf(node), 1);
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

export { Node, addNode, removeNode, removeOnlyParent };