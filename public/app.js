const ShapeType = {
    CIRCLE: { name: 'circle', numSides: 1 },
    TRIANGLE: { name: 'triangle', numSides: 3 },
    SQUARE: { name: 'square', numSides: 4 },
    PENTAGON: { name: 'pentagon', numSides: 5 },
    HEXAGON: { name: 'hexagon', numSides: 6 },
    SEPTAGON: { name: 'septagon', numSides: 7 },
    OCTAGON: { name: 'octagon', numSides: 8 },
    NONAGON: { name: 'nonagon', numSides: 8 }
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
        this.dragOffsetX = 0; // Offset X from mouse to center
        this.dragOffsetY = 0; // Offset Y from mouse to center
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
const centralNode = new Node(canvas.width / 2, canvas.height / 2, 100, ShapeType.SQUARE);

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
}function mouseDown(e) {
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
            console.log("Orbital node is now being dragged");
            return; // Stop checking once a node has been selected to drag
        }
    }
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
    ctx.fillRect(centralNode.x - centralNode.size / 2, centralNode.y - centralNode.size / 2, centralNode.size, centralNode.size);
    ctx.beginPath();
    ctx.setLineDash([5, 15]);
    ctx.strokeStyle = 'gray';
    ctx.arc(centralNode.x, centralNode.y, radius, 0, 2 * Math.PI);
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


function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}

function update() {
    const centerX = centralNode.x;
    const centerY = centralNode.y;

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
        centralNode.dragOffsetX = mouseX - centralNode.x;
        centralNode.dragOffsetY = mouseY - centralNode.y;
        console.log("Central node is now being dragged");
        return;
    }

    // Check if any orbital node is clicked
    for (const node of nodes) {
        if (isMouseOver(mouseX, mouseY, node)) {
            node.dragging = true;
            node.dragOffsetX = mouseX - node.x;
            node.dragOffsetY = mouseY - node.y;
            console.log("Orbital node is now being dragged");
            return; // Stop checking once a node has been selected to drag
        }
    }
}

function isMouseOver(mouseX, mouseY, node) {
    switch (node.shapeType.name) {
        case 'circle':
            return isOverCircle(mouseX, mouseY, node);
        case 'triangle':
        case 'square':
        case 'pentagon':
        case 'hexagon':
        case 'septagon':
        case 'octagon':
        case 'nonagon':
            return isOverPolygon(mouseX, mouseY, node);
        default:
            console.error('Unknown shape type:', node.shapeType.name);
            return false;
    }
}

function isOverCircle(x, y, node) {
    const distance = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
    return distance < node.size / 2;
}

function isOverPolygon(x, y, node) {
    const numSides = node.shapeType.numSides;
    const radius = node.size / 2;
    let inside = false;
    for (let i = 0, j = numSides - 1; i < numSides; j = i++) {
        const xi = node.x + radius * Math.cos(2 * Math.PI * i / numSides + node.angle);
        const yi = node.y + radius * Math.sin(2 * Math.PI * i / numSides + node.angle);
        const xj = node.x + radius * Math.cos(2 * Math.PI * j / numSides + node.angle);
        const yj = node.y + radius * Math.sin(2 * Math.PI * j / numSides + node.angle);

        const intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}


function pointInPolygon(point, polygon) {
    let isInside = false;
    const numPoints = polygon.length;
    let j = numPoints - 1;
    for (let i = 0; i < numPoints; j = i++) {
        const xi = polygon[i].x, yi = polygon[i].y;
        const xj = polygon[j].x, yj = polygon[j].y;
        const intersect = ((yi > point.y) !== (yj > point.y))
            && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
        if (intersect) isInside = !isInside;
    }
    return isInside;
}

function mouseMove(e) {
    const mouseX = e.pageX - canvas.offsetLeft;
    const mouseY = e.pageY - canvas.offsetTop;

    if (centralNode.dragging) {
        centralNode.x = mouseX - centralNode.dragOffsetX;
        centralNode.y = mouseY - centralNode.dragOffsetY;
    }

    nodes.forEach(node => {
        if (node.dragging) {
            node.x = mouseX - node.dragOffsetX;
            node.y = mouseY - node.dragOffsetY;
        }
    });

    draw();
}

function checkCollision(node1, node2) {
    const shape1 = node1.shapeType.name;
    const shape2 = node2.shapeType.name;

    if (shape1 === 'circle' && shape2 === 'circle') {
        return circleCircleCollision(node1, node2);
    } else if ((shape1 === 'circle' && isPolygon(shape2)) || (shape2 === 'circle' && isPolygon(shape1))) {
        return circlePolygonCollision(node1, node2);
    } else if (isPolygon(shape1) && isPolygon(shape2)) {
        return polygonPolygonCollision(node1, node2);
    } else {
        return boundingCircleCollision(node1, node2);  // Default check for undefined or complex shapes
    }
}

function isPolygon(shape) {
    return ['triangle', 'square', 'pentagon', 'hexagon', 'septagon', 'octagon', 'nonagon'].includes(shape);
}

function circleCircleCollision(node1, node2) {
    const dx = node1.x - node2.x;
    const dy = node1.y - node2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const totalRadius = (node1.size + node2.size) / 2;
    return distance < totalRadius;
}

function circlePolygonCollision(circleNode, polygonNode) {
    // Ensure the first node is always the circle for simplicity
    if (!isPolygon(polygonNode.shapeType.name)) {
        [circleNode, polygonNode] = [polygonNode, circleNode];
    }
    const numSides = polygonNode.shapeType.numSides;
    const radius = polygonNode.size / 2;
    const circleRadius = circleNode.size / 2;

    // Check if circle's center is inside the polygon (using isOverPolygon)
    if (isOverPolygon(circleNode.x, circleNode.y, polygonNode)) {
        return true;
    }

    // Check distance from circle center to each polygon edge
    for (let i = 0, j = numSides - 1; i < numSides; j = i++) {
        const xi = polygonNode.x + radius * Math.cos(2 * Math.PI * i / numSides + polygonNode.angle);
        const yi = polygonNode.y + radius * Math.sin(2 * Math.PI * i / numSides + polygonNode.angle);
        const xj = polygonNode.x + radius * Math.cos(2 * Math.PI * j / numSides + polygonNode.angle);
        const yj = polygonNode.y + radius * Math.sin(2 * Math.PI * j / numSides + polygonNode.angle);

        if (pointToSegmentDistance(circleNode.x, circleNode.y, xi, yi, xj, yj) < circleRadius) {
            return true;
        }
    }
    return false;
}


function polygonPolygonCollision(node1, node2) {
    const vertices1 = getPolygonVertices(node1);
    const vertices2 = getPolygonVertices(node2);

    // Check all axes of both polygons
    return checkSATCollision(vertices1, vertices2) && checkSATCollision(vertices2, vertices1);
}

function checkSATCollision(vertices1, vertices2) {
    for (let i = 0; i < vertices1.length; i++) {
        // Get the normal of the current edge
        const currentVertex = vertices1[i];
        const nextVertex = vertices1[(i + 1) % vertices1.length];
        const edge = {
            x: nextVertex.x - currentVertex.x,
            y: nextVertex.y - currentVertex.y
        };
        const normal = { x: -edge.y, y: edge.x };

        const projection1 = projectVertices(vertices1, normal);
        const projection2 = projectVertices(vertices2, normal);
        
        // Check if there is a gap between the projections
        if (projection1.max < projection2.min || projection2.max < projection1.min) {
            return false; // No collision
        }
    }
    return true; // Collision detected
}

function projectVertices(vertices, axis) {
    let min = dotProduct(vertices[0], axis);
    let max = min;
    for (const vertex of vertices) {
        const projection = dotProduct(vertex, axis);
        if (projection < min) min = projection;
        if (projection > max) max = projection;
    }
    return { min, max };
}

function dotProduct(point, axis) {
    return point.x * axis.x + point.y * axis.y;
}

function boundingCircleCollision(node1, node2) {
    // Simple bounding circle collision check for complex shapes
    const dx = node1.x - node2.x;
    const dy = node1.y - node2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const totalRadius = (node1.size + node2.size) / 2;
    return distance < totalRadius;
}

function pointToSegmentDistance(px, py, ax, ay, bx, by) {
    const pax = px - ax, pay = py - ay, bax = bx - ax, bay = by - ay;
    const h = Math.max(0, Math.min(1, (pax * bax + pay * bay) / (bax * bax + bay * bay)));
    const dx = ax + h * bax - px, dy = ay + h * bay - py;
    return Math.sqrt(dx * dx + dy * dy);
}

function mouseUp() {
    if (centralNode.dragging) {
        centralNode.dragging = false;
        centralNode.dragOffsetX = 0;
        centralNode.dragOffsetY = 0;
    }
    nodes.forEach(node => {
        if (node.dragging) {
            node.dragging = false;
            node.dragOffsetX = 0;
            node.dragOffsetY = 0;
        }
    });
}

function getPolygonArea(numSides, radius) {
    if (numSides < 3) return 0; // not a polygon
    const sideLength = 2 * radius * Math.sin(Math.PI / numSides);
    const apothem = radius * Math.cos(Math.PI / numSides);
    return (numSides * sideLength * apothem) / 2;
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

function getPolygonVertices(node) {
    const vertices = [];
    const numSides = node.shapeType.numSides;
    const radius = node.size / 2;
    for (let i = 0; i < numSides; i++) {
        const angle = 2 * Math.PI * i / numSides + node.angle;
        const x = node.x + radius * Math.cos(angle);
        const y = node.y + radius * Math.sin(angle);
        vertices.push({ x, y });
    }
    return vertices;
}




function animate() {
    update();
    requestAnimationFrame(animate);
}


requestAnimationFrame(animate);

draw();