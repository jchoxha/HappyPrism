// nodes.js
import { Logger } from '../Debug/logger.js';
import { ShapeType } from '../Misc/shapes.js';
import { getRandomColor, isValidColorString } from '../Misc/colors.js';
import { generateUUID } from '../Misc/utils.js';
import { CanvasEvent } from './Canvas/canvasEventClass.js';

class Node {
  constructor(startingX, startingY, type = "shape") {
    this.name = "New Node";
    this.id = generateUUID();
    //Possible Values:
    //  "shape", "text", "line",
    this.type = type;

    //Positioning
    this.x = this.intendedX = this.fixedX = this.lastX = startingX;
    this.y = this.intendedY = this.fixedY = this.lastY = startingY;

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

  remove(canvasManager) {
    // if (canvasManager.highlightedNode == node) {
    //   canvasManager.highlightedNode = null;
    // }
    // if (canvasManager.selectedNode == node) {
    //   canvasManager.selectedNode = null;
    // }
    canvasManager.nodes.splice(canvasManager.nodes.indexOf(this), 1);
  }
}

function addNode_Shape(canvasManager, node = null) {
 
  let newNode = null;
  if(node){
    newNode = node;
  }else{

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

  newNode = new Node(nodeX + width / 2, nodeY + height / 2, "shape");


  newNode.shapeWidth = width;
  newNode.shapeHeight = height;
  newNode.shapeFillColor = canvasManager.IM3shapeFillColor;
  newNode.shapeStrokeWidth = canvasManager.IM3shapeStrokeWidth;
  newNode.shapeStrokeColor = canvasManager.IM3shapeStrokeColor;
  newNode.shapeType = canvasManager.IM3shapeType;

  newNode.positionFixed = false;

  canvasManager.IM3shapeDims.width = newNode.shapeWidth;
  canvasManager.IM3shapeDims.height = newNode.shapeHeight;
  }
  Logger.log("Adding node:", newNode);
  canvasManager.nodes.push(newNode);
  return newNode;
}

function addNodes(canvasManager, nodes = [], recordEvent = true, triggeredByHistory = false) {
  let newCanvasEvent = null;
  if(recordEvent){newCanvasEvent = new CanvasEvent("addNodes");}
  //If a new individual node is being added
  if(nodes == "shape"){
    const newNode = addNode_Shape(canvasManager);
    if(recordEvent) {newCanvasEvent.nodes.push(newNode);}
  }
  //If multiple, pre-made nodes are being added
  else if (nodes.length > 0){
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].type == "shape") {
        const newNode = addNode_Shape(canvasManager, nodes[i]);
        if(recordEvent) {newCanvasEvent.nodes.push(newNode);}
      }  
    }
  }
  if(recordEvent) {
    canvasManager.addHistoryEvent(newCanvasEvent, triggeredByHistory);
  }
  canvasManager.setNeedsUpdating(true, 1);
  return;
}

function removeNodes(canvasManager, nodes, recordEvent = true, triggeredByHistory = false) {
  let newCanvasEvent = null;
  if(recordEvent){newCanvasEvent = new CanvasEvent("removeNodes");}
  for (let i = 0; i < nodes.length; i++) {
    if(recordEvent) {newCanvasEvent.nodes.push(nodes[i]);}
    nodes[i].remove(canvasManager);
  }
  if(recordEvent) {
    canvasManager.addHistoryEvent(newCanvasEvent, triggeredByHistory);
  }
  canvasManager.setNeedsUpdating(true, 1);
}

function moveNodes(canvasManager, recordEvent = true, triggeredByHistory = false) {
  let newCanvasEvent = null;
  if(recordEvent){newCanvasEvent =new CanvasEvent("moveNodes");}
  const nodesToMove = canvasManager.IM1nodesBeingDragged;
  for (let i = 0; i < nodesToMove.length; i++) {
    if(recordEvent) {newCanvasEvent.nodes.push(nodesToMove[i]);}
    //If the history buttons are doing this, then we just want to swap its current position with its last position
    if(triggeredByHistory){
      const tempX = nodesToMove[i].x;
      const tempY = nodesToMove[i].y;
      nodesToMove[i].x = nodesToMove[i].lastX;
      nodesToMove[i].y = nodesToMove[i].lastY;
      nodesToMove[i].lastX = tempX;
      nodesToMove[i].lastY = tempY;
    }
  }
  if(recordEvent) {
    canvasManager.addHistoryEvent(newCanvasEvent, triggeredByHistory);
  }
  canvasManager.setNeedsUpdating(true, 1);
}


export { Node, addNodes, removeNodes, moveNodes};