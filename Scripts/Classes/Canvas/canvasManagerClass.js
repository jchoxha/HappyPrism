// canvasManager.js
import { Logger } from '../../Debug/logger.js';
import { drawCanvas, drawTemporaryShape } from './methods/drawCanvas.js';
import { getRandomColor } from '../../Misc/colors.js';

class CanvasManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        this.needsUpdating = true; //Controls whether update code will run
        this.numUpdatesScheduled = 0; //If 0, will continuously update when needsUpdating is true
        this.updateCount = 0;

        this.physicsEnabled = false;

        this.theme = null;
        this.currentTime = Date.now();

        this.nodes = [];
        this.selectedNode = null;
        this.highlightedNode = null;

        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.xCenter = 0;
        this.yCenter = 0;

        this.draggingCanvas = false;
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

        //Canvas Interaction Mode
            //Possible values (with Interaction Mode ID Number):
            //selectCanvas (IM1), dragCanvas(IM2), addShape(IM3), 
            this.interactionMode = "selectCanvas";

                //selectCanvas (IM1) properties
                this.IM1showBoundingBoxNodes = [];
                this.IM1showEditBoxNodes = [];
                this.IM1nodesBeingDragged = [];

                this.IM1draggingNodes = false;

                this.IM1draggingSelectionBox = false;
                this.IM1selectionBoxStartPos = { x: 0, y: 0 };
                this.IM1selectionBoxEndPos = { x: 0, y: 0 };
                //IM1 & IM2 properties
                this.lastIM1OrIM2 = 1;
                //dragCanvas (IM2) properties
                this.IM2tempCanvasDrag = false;
                //addShape (IM3) properties
                    //Possible values: circle, rectangle
                    this.IM3shapeType = "elipse";

                    this.IM3shapeFillColor =  getRandomColor();
                    this.IM3shapeStrokeColor = "black";
                    this.IM3shapeStrokeWidth = 0;
                    this.IM3shapeStrokeStyle = "solid";

                    this.IM3shapeDims = {width: 0, height: 0};

                    this.IM3draggingShape = false;
                    this.IM3shapeStartPos = { x: 0, y: 0 };
                    this.IM3shapeEndPos = { x: 0, y: 0 };

        // CANVAS UI ELEMNENTS

            //Popups
            this.popUpOpen = false;

            //Lower Bar

                //Select or Drag Menu
                this.toggleSelectOrDragMenu = false;
                //AddShapeMenu
                this.toggleAddShapeMenu = false;

        // Node Details
        this.toggleNodeDetails = false;
        this.nodeDetailsStaticContentInit = false;

        // Canvas Details
        this.toggleCanvasDetails = false;

        //Grid
        this.gridColor = null;
        this.gridInterval = 200;
    }

    initCanvas(appManager) {
        this.theme = appManager.theme;
        this.canvas.style.background = this.theme.canvas_background;
        this.gridColor = this.theme.canvas_grid_color;
        this.resizeCanvas();
        window.addEventListener('resize', this.resizeCanvas.bind(this));
    }

    update() {
        //console.log("Attempting to update canvas")
        if(this.needsUpdating) {


            //Actuall stuff to update///
            this.currentTime = Date.now();
            this.updateCanvasRange();
            drawCanvas(this);
            //End of important update code///

            //After first update, set needsUpdating to false
            if (this.updateCount == 0) {
                this.setNeedsUpdating(false);
            }
            
            //Increment update count
            this.updateCount++;

            //Check if number of updates is limited 
            //  e.g. when scrolling, we only want one update per call
            if(this.numUpdatesScheduled > 0){
                this.numUpdatesScheduled--;
                if(this.numUpdatesScheduled == 0){
                    this.setNeedsUpdating(false);
                }
            }
            return;
        }
        //console.log("Canvas not updated");
    }

    setNeedsUpdating(needsUpdating, times = 0) {
        this.needsUpdating = needsUpdating;
        Logger.log('CanvasManager.needsUpdating set to: ', this.needsUpdating);
        if (times > 0){
            this.numUpdatesScheduled = times;
            Logger.log('CanvasManager.numUpdatesScheduled set to: ', this.numUpdatesScheduled);
        }
    }

    setCanvasManagerInteractionMode(mode){

        
        

        if(mode == "selectCanvas" || mode == "IM1" || mode == 1){
            this.interactionMode = "selectCanvas";
            this.lastIM1OrIM2 = 1;
            document.getElementById("canvas").style.cursor = "url('Assets/Images/Cursors/Select/cursor_select.svg') 4 4, auto";

            const selectButton = document.getElementById("select-canvas-button");
            const dragButton = document.getElementById("drag-canvas-button");
            const selectOrDragButton = document.getElementById("select-or-drag-button");
            if(selectOrDragButton) {
                const selectOrDragImg = selectOrDragButton.querySelector('img');
                if(selectOrDragImg){ selectOrDragImg.src = "Assets/Images/Icons/ui/Canvas/Lower/Popups/SelectDrag/select.svg";}
            }
            if(dragButton && selectButton) {dragButton.classList.remove('button-active'); selectButton.classList.add('button-active');}
        }
        else if(mode == "dragCanvas" || mode == "IM2" || mode == 2){
            this.interactionMode = "dragCanvas";
            this.lastIM1OrIM2 = 2;
            document.getElementById("canvas").style.cursor = "url('Assets/Images/Cursors/Drag/hand-open.svg') 16 16, auto";

            const selectButton = document.getElementById("select-canvas-button");
            const dragButton = document.getElementById("drag-canvas-button");
            const selectOrDragButton = document.getElementById("select-or-drag-button");
            if(selectOrDragButton) {
                const selectOrDragImg = selectOrDragButton.querySelector('img');
                if(selectOrDragImg){ selectOrDragImg.src = "Assets/Images/Icons/ui/Canvas/Lower/Popups/SelectDrag/drag.svg";}
            }
            if(dragButton && selectButton) {dragButton.classList.add('button-active'); selectButton.classList.remove('button-active');}
        }
        else if(mode == "addShape" || mode == "IM3" || mode == 3){
            this.interactionMode = "addShape";
            document.getElementById("canvas").style.cursor = "url('Assets/Images/Cursors/Crosshair/crosshair.svg') 16.5 16.5, auto";
        }
    }


    resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.translateX = (this.canvas.width - rect.left) / 2;
        this.translateY = (this.canvas.height - rect.top) / 2;
    }

    updateCanvasRange() {
        this.topLeftX = -this.translateX / this.scale;
        this.topLeftY = -this.translateY / this.scale;
        this.bottomRightX = this.topLeftX + (this.canvas.width / this.scale);
        this.bottomRightY = this.topLeftY + (this.canvas.height / this.scale);
        this.visibleWidth = this.bottomRightX - this.topLeftX;
        this.visibleHeight = this.bottomRightY - this.topLeftY;
    }

    drawTempShape() {
        drawTemporaryShape(this);
    }


}

export { CanvasManager };
