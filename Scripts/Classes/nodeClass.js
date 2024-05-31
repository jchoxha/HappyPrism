// nodes.js
import { Logger } from '../Debug/logger.js';
import { ShapeType } from '../Misc/shapes.js';
import { getRandomColor, isValidColorString } from '../Misc/colors.js';
import { generateUUID } from '../Misc/utils.js';

class Node {
  constructor(startingX, startingY, type = "shape") {
    this.name = "New Node";
    this.id = generateUUID();
    //Possible Values:
    //  "shape", "text", "line",
    this.type = type;

    //Positioning
    this.x = this.intendedX = this.fixedX = startingX;
    this.y = this.intendedY = this.fixedY = startingY;

    //Shape Properties
    this.shapeType = null;
    this.shapeWidth = null;
    this.shapeHeight = null;
    this.shapeFillColor = null;
    this.shapeStrokeWidth = null;
    this.shapeStrokeColor = null;


    this.isResizing = false;

    //Physics
    this.vx = this.vy = 0; //Velocity
    this.positionFixed = true;
    this.positionOnDragStart = { x: 0, y: 0 };
    this.dragOffsetX = this.dragOffsetY = 0;
    

    //Handle dragging
    this.dragging = this.inMovementAfterDragging = this.inMovementAfterCollision = false;

    //Node Shape Visuals
    
    this.shapeType = ShapeType.ELIPSE;
    this.fill = null;
    if (!this.fill) {
      this.setFillStyle("randomColor");
    }
    
  }

  setFillStyle(fill) {
    if (fill === "randomColor") {
      this.fill = getRandomColor();
    } else if (isValidColorString(fill)) {
      this.fill = fill;
    } else {
      Logger.error(`Invalid color: ${fill}, using black instead`);
      this.fill = 'black';
    }
    this.fillStyle = "solidColor";
  }
}

function addNode_Shape(canvasManager) {
  console.log("Adding shape node");
  console.log("Drawing temporary shape");
  const ctx = canvasManager.ctx;
  let startX = canvasManager.IM3shapeStartPos.x * canvasManager.scale + (canvasManager.translateX);
  let startY = canvasManager.IM3shapeStartPos.y * canvasManager.scale + (canvasManager.translateY);
  let width = (canvasManager.IM3shapeEndPos.x * canvasManager.scale + (canvasManager.translateX) - startX);
  let height = (canvasManager.IM3shapeEndPos.y * canvasManager.scale +(canvasManager.translateY) - startY);

  let nodeX = canvasManager.IM3shapeStartPos.x;
  let nodeY = canvasManager.IM3shapeStartPos.y;

  if (width < 0) {
      nodeX = canvasManager.IM3shapeEndPos.x;
      width = -width;
  }
  if (height < 0) {
      nodeY = canvasManager.IM3shapeEndPos.y;
      height = -height;
  }

  width /= canvasManager.scale;
  
  height /= canvasManager.scale;

  const newNode = new Node(nodeX + width / 2, nodeY + height / 2, "shape");


  newNode.shapeWidth = width;
  newNode.shapeHeight = height;
  newNode.shapeFillColor = canvasManager.IM3shapeFillColor;
  newNode.shapeStrokeWidth = canvasManager.IM3shapeStrokeWidth;
  newNode.shapeStrokeColor = canvasManager.IM3shapeStrokeColor;
  newNode.shapeType = canvasManager.IM3shapeType;

  newNode.positionFixed = false;

  Logger.log("Adding node:", newNode);
  canvasManager.nodes.push(newNode);
  canvasManager.IM3shapeDims.width = newNode.shapeWidth;
  canvasManager.IM3shapeDims.height = newNode.shapeHeight;
  console.log(canvasManager.IM3shapeDims);
  return newNode;
}

function addNode(canvasManager, nodeType = "shape") {

  if (nodeType === "shape") {
    
  }

  let startingPosition = canvasManager.mousePositionOnDown;
  Logger.log("Starting position:", startingPosition);

  const newNode = new Node(startingPosition.x, startingPosition.y);
  newNode.positionFixed = false;

  Logger.log("Adding node:", newNode);
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


export { Node, addNode, addNode_Shape, removeNode };