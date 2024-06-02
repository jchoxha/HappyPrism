class CanvasEvent {
    constructor(action = null) {
        this.action = action;
        this.nodes = [];
        //Array of objects with the following properties:
        //{fromPos: {x: number, y: number}, toPos: {x: number, y: number}}
        this.nodesLocationChange = [];
        this.time = null;
    }
    
}

export { CanvasEvent };