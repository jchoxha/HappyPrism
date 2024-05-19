// nodes.js
import { ShapeType } from '../Misc/shapes.js';
import { getRandomColor, isValidColorString } from '../Misc/colors.js';
import { generateUUID } from '../Misc/utils.js';

class Node {
  constructor(startingX, startingY, size = 50, shapeType = ShapeType.CIRCLE, fill = "randomColor") {
    this.name = "New Node";
    this.id = generateUUID();

    //Positioning
    this.x = this.intendedX = this.fixedX = startingX;
    this.y = this.intendedY = this.fixedY = startingY;

    //Node Sizing
    this.size = size;
    this.isResizing = false;

    //Physics
    this.vx = this.vy = 0; //Velocity
    this.positionFixed = true;
    this.positionOnDragStart = { x: 0, y: 0 };
    this.dragOffsetX = this.dragOffsetY = 0;
    

    //Handle dragging
    this.dragging = this.inMovementAfterDragging = this.inMovementAfterCollision = false;

    //Node Visuals
    this.shapeType = shapeType;
    this.fill = fill;
    this.setFillStyle(fill);
  }

  setFillStyle(fill) {
    if (fill === "randomColor") {
      this.fill = getRandomColor();
    } else if (isValidColorString(fill)) {
      this.fill = fill;
    } else {
      console.error(`Invalid color: ${fill}, using black instead`);
      this.fill = 'black';
    }
    this.fillStyle = "solidColor";
  }

}

function addNode(canvasManager) {
 
  let startingPosition = canvasManager.mousePositionOnDown;
  console.log("Starting position:", startingPosition)

  const newNode = new Node(startingPosition.x, startingPosition.y);
  newNode.positionFixed = false;

  console.log("Adding node:", newNode);
  canvasManager.nodes.push(newNode);
  if(!canvasManager.toggleNodeDetails) {
    canvasManager.toggleNodeDetails = !canvasManager.toggleNodeDetails;
  }
  return newNode;
}

function removeNode(canvasManager, node) {
  if (canvasManager.highlightedNode == node) {
    canvasManager.highlightedNode = null;
  }
  if (canvasManager.selectedNode == node) {
    canvasManager.selectedNode = null;
  }
  canvasManager.nodes.splice(canvasManager.nodes.indexOf(node), 1);
}


export { Node, addNode, removeNode };