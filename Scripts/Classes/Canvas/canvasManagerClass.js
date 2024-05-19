// canvasManager.js
import { drawCanvas } from './drawCanvas.js';

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
        this.nodeDetailsStaticContentInit = false;
        this.toggleCanvasDetails = false;
        this.theme = null;
        this.currentTime = Date.now();
    }

    initCanvas(theme) {
        this.theme = theme;
        this.canvas.style.background = theme.canvas_background;
        this.resizeCanvas();
        window.addEventListener('resize', this.resizeCanvas.bind(this));
    }

    update() {
        this.currentTime = Date.now();
        this.updateCanvasRange();
        drawCanvas(this);
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.translateX = this.canvas.width / 2;
        this.translateY = this.canvas.height / 2;
    }

    updateCanvasRange() {
        this.topLeftX = -this.translateX / this.scale;
        this.topLeftY = -this.translateY / this.scale;
        this.bottomRightX = this.topLeftX + (this.canvas.width / this.scale);
        this.bottomRightY = this.topLeftY + (this.canvas.height / this.scale);
        this.visibleWidth = this.bottomRightX - this.topLeftX;
        this.visibleHeight = this.bottomRightY - this.topLeftY;
    }



}

export { CanvasManager };
