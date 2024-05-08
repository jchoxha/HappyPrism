import { ShapeType } from './shapes.js';
import { Node, addNode, removeNode } from './nodes.js';
import { CanvasManager } from './canvasManager.js';
import { setupEventListeners } from './eventManager.js'
import { physicsUpdate } from './physics.js'

document.addEventListener('DOMContentLoaded', () => {
    const canvasManager = new CanvasManager('canvas');
    setupEventListeners(canvasManager);  // Assuming setupEventListeners is adapted to work with CanvasManager
    addNode(canvasManager.nodes, new Node(150, 150, 50, ShapeType.CIRCLE, "red"));
    addNode(canvasManager.nodes, new Node(250, 250, 50, ShapeType.CIRCLE, "blue", canvasManager.nodes[0]));
    function update() {
        physicsUpdate(canvasManager);
        canvasManager.draw();
    }
    function animate() {
        update();
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
});



// function updateNodes() {
//     const angularSeparation = 2 * Math.PI / (nodes.length);
//     nodes.forEach((node, index) => {
//         node.angle = angularSeparation * index;
//         node.refAngle = angularSeparation * index;
//     });
//     draw();
// }


// function draw() {
//     ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
//     ctx.fillStyle = 'red'; // Central node color
//     ctx.fillRect(centralNode.x - centralNode.size / 2, centralNode.y - centralNode.size / 2, centralNode.size, centralNode.size); // Draw central node
//     ctx.beginPath();
//     ctx.setLineDash([5, 15]); // Style for the orbit circle
//     ctx.strokeStyle = 'gray'; // Orbit circle color
//     ctx.arc(centralNode.x, centralNode.y, radius, 0, 2 * Math.PI); // Draw orbit circle
//     ctx.stroke();
//     ctx.setLineDash([]); // Reset line dash style
//     ctx.fillStyle = 'blue'; // Orbital nodes color
//     nodes.forEach(node => drawNode(ctx, node)); // Draw each node

//     // Draw window and canvas size
//     ctx.font = '16px Arial'; // Set font for text
//     ctx.fillStyle = 'black'; // Text color
//     ctx.textAlign = 'left'; // Align text to the left
//     ctx.fillText('Window Size: ' + window.innerWidth + ' x ' + window.innerHeight, 10, 20); // Display window size
//     ctx.fillText('Canvas Size: ' + canvas.width + ' x ' + canvas.height, 10, 40); // Display canvas size
// }

// function getPolygonArea(numSides, radius) {
//     if (numSides < 3) return 0; // not a polygon
//     const sideLength = 2 * radius * Math.sin(Math.PI / numSides);
//     const apothem = radius * Math.cos(Math.PI / numSides);
//     return (numSides * sideLength * apothem) / 2;
// }

// function getNodeArea(node) {
//     switch (node.shapeType.name) {
//         case 'circle':
//             return Math.PI * (node.size / 2) * (node.size / 2);
//         case 'triangle':
//             return getPolygonArea(3, node.size / 2);
//         case 'square':
//             return getPolygonArea(4, node.size / 2);
//         case 'pentagon':
//             return getPolygonArea(5, node.size / 2);
//         case 'hexagon':
//             return getPolygonArea(6, node.size / 2);
//         case 'septagon':
//             return getPolygonArea(7, node.size / 2);
//         case 'octagon':
//             return getPolygonArea(8, node.size / 2);
//         case 'nonagon':
//             return getPolygonArea(9, node.size / 2);
//         default:
//             console.error('Unknown shape type:', node.shapeType.name);
//             return 0;
//     }
// }