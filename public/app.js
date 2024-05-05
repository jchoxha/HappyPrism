const ShapeType = {
    CIRCLE: { name: 'circle', numSides: 1 },
    TRIANGLE: { name: 'triangle', numSides: 3 },
    SQUARE: { name: 'square', numSides: 4 },
    PENTAGON: { name: 'pentagon', numSides: 5 },
    HEXAGON: { name: 'hexagon', numSides: 6 },
    SEPTAGON: { name: 'septagon', numSides: 7 },
    OCTAGON: { name: 'octagon', numSides: 8 },
    NONAGON: { name: 'nonagon', numSides: 8 },
    STAR: { name: 'star', numSides: 10 } // Adjust based on how you treat the sides of a star.
};

class Node {
    constructor(x, y, size, shapeType) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.vx = 0;
        this.vy = 0;
        this.angle = 0;
        this.refAngle = 0;
        this.dragging = false;
        this.shapeType = shapeType;
    }
}



const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const MAX_VELOCITY = 650;  // Maximum pixels per second


const radius = 200;
const angularVelocity = 0.001;
const center = { x: canvas.width / 2, y: canvas.height / 2 };
let angle = 0;

document.getElementById('addNode').addEventListener('click', function() {
    const selectedShape = document.getElementById('shapeTypeSelect').value;
    addNode(ShapeType[selectedShape]);
});
document.getElementById('removeNode').addEventListener('click', removeNode);

const nodes = [];
const centralNode = new Node(canvas.width / 2 - 50, canvas.height / 2 - 50, 100, ShapeType.SQUARE);

function addNode(shapeType) {
    const newAngle = 2 * Math.PI / (nodes.length + 1);
    const size = 75;  // Example size for new nodes

    // Calculate the exact center position for the new node
    const newNode = new Node(
        centralNode.x + radius * Math.cos(newAngle * nodes.length),
        centralNode.y + radius * Math.sin(newAngle * nodes.length),
        size,
        shapeType
    );
    newNode.angle = newAngle * nodes.length;
    newNode.refAngle = newAngle * nodes.length;
    nodes.push(newNode);
    updateNodes();
}

function removeNode() {
    if (nodes.length > 0) {
        nodes.pop(); // Removes the last added node
        console.log("Node removed. Total nodes: " + nodes.length);
        updateNodes();
    } else {
        console.log("No nodes left to remove.");
    }
}


function updateNodes() {
    const angularSeparation = 2 * Math.PI / (nodes.length);
    nodes.forEach((node, index) => {
        node.angle = angularSeparation * index;
        node.refAngle = angularSeparation * index;
    });
    draw();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'red';
    ctx.fillRect(centralNode.x, centralNode.y, centralNode.size, centralNode.size);
    ctx.beginPath();
    ctx.setLineDash([5, 15]);
    ctx.strokeStyle = 'gray';
    ctx.arc(centralNode.x + centralNode.size / 2, centralNode.y + centralNode.size / 2, radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'blue';
    nodes.forEach(node => drawNode(ctx, node));
}

function drawNode(ctx, node) {
    const x = node.x;  // x is now the center
    const y = node.y;  // y is now the center
    const radius = node.size / 2;

    ctx.beginPath();
    switch (node.shapeType.name) {
        case 'circle':
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            break;
        case 'triangle':
        case 'square':
        case 'pentagon':
        case 'hexagon':
        case 'septagon':
        case 'octagon':
        case 'nonagon':
            drawPolygon(ctx, x, y, node.shapeType.numSides, radius);
            break;
        case 'star':
            drawStar(ctx, x, y, radius);
            break;
        default:
            console.error('Unknown shape type:', node.shapeType.name);
    }
    ctx.closePath();
    ctx.fill();
}

function drawPolygon(ctx, x, y, numSides, radius) {
    ctx.moveTo(x + radius, y);
    for (let i = 1; i <= numSides; i++) {
        ctx.lineTo(x + radius * Math.cos(2 * Math.PI * i / numSides), y + radius * Math.sin(2 * Math.PI * i / numSides));
    }
}

function drawStar(ctx, x, y, radius) {
    const outerRadius = radius;
    const innerRadius = radius / 2;
    const steps = 10; // 5 points + 5 inner vertices
    let angle = Math.PI / 2;

    ctx.moveTo(x + outerRadius * Math.cos(angle), y - outerRadius * Math.sin(angle));
    for (let i = 1; i <= steps; i++) {
        const r = (i % 2 === 0) ? outerRadius : innerRadius;
        angle += Math.PI / 5;
        ctx.lineTo(x + r * Math.cos(angle), y - r * Math.sin(angle));
    }
}

function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}

function update() {
    const centerX = centralNode.x + centralNode.size / 2;
    const centerY = centralNode.y + centralNode.size / 2;

    nodes.forEach(node => {
        node.refAngle += angularVelocity;
        node.refAngle %= 2 * Math.PI; // Normalize the angle

        const intendedX = centerX + radius * Math.cos(node.refAngle);
        const intendedY = centerY + radius * Math.sin(node.refAngle);

        if (!node.dragging) {
            node.x = lerp(node.x, intendedX, 0.05);
            node.y = lerp(node.y, intendedY, 0.05);
        }
    });

    detectCollisions(); // Check for collisions
    draw();
}

canvas.addEventListener('mousedown', mouseDown, false);
canvas.addEventListener('mouseup', mouseUp, false);
canvas.addEventListener('mousemove', mouseMove, false);

function mouseDown(e) {
    const mouseX = e.pageX - canvas.offsetLeft;
    const mouseY = e.pageY - canvas.offsetTop;

    // Check if central node is clicked
    if (isMouseOver(mouseX, mouseY, centralNode)) {
        centralNode.dragging = true;
        console.log("Central node is now being dragged");
        return;
    }

    // Check if any orbital node is clicked
    for (const node of nodes) {
        if (isMouseOver(mouseX, mouseY, node)) {
            node.dragging = true;
            console.log("Node is now being dragged");
            return; // Stop checking once a node has been selected to drag
        }
    }
}

function isMouseOver(mouseX, mouseY, node) {
    const centerX = node.x;
    const centerY = node.y;
    const distance = Math.sqrt((centerX - mouseX) ** 2 + (centerY - mouseY) ** 2);
    return distance < node.size / 2;
}

function mouseMove(e) {
    const mouseX = e.pageX - canvas.offsetLeft;
    const mouseY = e.pageY - canvas.offsetTop;

    if (centralNode.dragging) {
        centralNode.x = mouseX;
        centralNode.y = mouseY;
       // console.log("Moving central node to", centralNode.x, centralNode.y);
    }

    nodes.forEach(node => {
        if (node.dragging) {
            node.x = mouseX;
            node.y = mouseY;
            //console.log("Moving node to", node.x, node.y);
        }
    });

    draw();
}

function checkCollision(node1, node2) {
    const xDist = (node1.x + node1.size / 2) - (node2.x + node2.size / 2);
    const yDist = (node1.y + node1.size / 2) - (node2.y + node2.size / 2);
    const distance = Math.sqrt(xDist * xDist + yDist * yDist);
    const radiusSum = node1.size / 2 + node2.size / 2;
    return distance < radiusSum;
}

function mouseUp() {
    centralNode.dragging = false;
    nodes.forEach(node => {
        node.dragging = false;
    });
}

function getPolygonArea(numSides, radius) {
    if (numSides < 3) return 0; // not a polygon
    const sideLength = 2 * radius * Math.sin(Math.PI / numSides);
    const apothem = radius * Math.cos(Math.PI / numSides);
    return (numSides * sideLength * apothem) / 2;
}

function getStarArea(outerRadius, innerRadius) {
    const outerArea = 5 * outerRadius * outerRadius * Math.sin(4 * Math.PI / 5) / 2;
    const innerArea = 5 * innerRadius * innerRadius * Math.sin(4 * Math.PI / 5) / 2;
    return outerArea + innerArea;
}

function getNodeArea(node) {
    switch (node.shapeType.name) {
        case 'circle':
            return Math.PI * (node.size / 2) * (node.size / 2);
        case 'triangle':
            return getPolygonArea(3, node.size / 2);
        case 'square':
            return getPolygonArea(4, node.size / 2);
        case 'pentagon':
            return getPolygonArea(5, node.size / 2);
        case 'hexagon':
            return getPolygonArea(6, node.size / 2);
        case 'septagon':
            return getPolygonArea(7, node.size / 2);
        case 'octagon':
            return getPolygonArea(8, node.size / 2);
        case 'nonagon':
            return getPolygonArea(9, node.size / 2);
        case 'star':
            return getStarArea(node.size / 2, node.size / 4); // Assuming inner radius is half of outer radius
        default:
            console.error('Unknown shape type:', node.shapeType.name);
            return 0;
    }
}

function detectCollisions() {
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            if (checkCollision(nodes[i], nodes[j])) {
                console.log(`Collision detected between node ${i} and node ${j}`);
            }
        }
    }
}


function animate() {
    update();
    requestAnimationFrame(animate);
}


requestAnimationFrame(animate);

draw();