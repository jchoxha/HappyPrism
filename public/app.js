class Node {
    constructor(x, y, width, height, type, numSides = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.vx = 0;
        this.vy = 0;
        this.angle = 0;
        this.refAngle = 0;
        this.dragging = false;
        this.type = type;
        this.numSides = numSides;
    }
}

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const MAX_VELOCITY = 650;  // Maximum pixels per second
const nodes = [];

const centralNode = new Node(canvas.width / 2 - 50, canvas.height / 2 - 50, 100, 100, 'square');
const radius = 200;
const angularVelocity = 0.001;
const center = { x: canvas.width / 2, y: canvas.height / 2 };
let angle = 0;

document.getElementById('addNode').addEventListener('click', () => addNode('circle'));
document.getElementById('removeNode').addEventListener('click', removeNode);

function addNode(type, numSides = 0) {
    const newAngle = 2 * Math.PI / (nodes.length + 1);
    nodes.forEach((node, index) => {
        node.angle = newAngle * index;
        node.refAngle = newAngle * index;
    });

    const newNode = new Node(
        centralNode.x + centralNode.width / 2 + radius * Math.cos(newAngle * nodes.length) - 75 / 2,
        centralNode.y + centralNode.height / 2 + radius * Math.sin(newAngle * nodes.length) - 75 / 2,
        75,
        75,
        type,
        numSides
    );
    newNode.angle = newAngle * nodes.length;
    newNode.refAngle = newAngle * nodes.length;
    nodes.push(newNode);
    updateNodes();
}

function removeNode() {
    if (nodes.length > 0) {
        nodes.pop();
        updateNodes();
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

function drawNode(ctx, node) {
    ctx.beginPath();
    if (node.type === 'circle') {
        ctx.arc(node.x, node.y, node.width / 2, 0, 2 * Math.PI);
    } else if (node.type === 'polygon' && node.numSides > 2) {
        const step = 2 * Math.PI / node.numSides;
        const radius = node.width / 2;
        ctx.moveTo(node.x + radius, node.y);
        for (let i = 1; i <= node.numSides; i++) {
            ctx.lineTo(node.x + radius * Math.cos(step * i), node.y + radius * Math.sin(step * i));
        }
    }
    ctx.closePath();
    ctx.fill();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'red';
    ctx.fillRect(centralNode.x, centralNode.y, centralNode.width, centralNode.height);
    ctx.beginPath();
    ctx.setLineDash([5, 15]);
    ctx.strokeStyle = 'gray';
    ctx.arc(centralNode.x + centralNode.width / 2, centralNode.y + centralNode.height / 2, radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'blue';
    nodes.forEach(node => drawNode(ctx, node));
}


function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}

function update() {
    const centerX = centralNode.x + centralNode.width / 2;
    const centerY = centralNode.y + centralNode.height / 2;

    nodes.forEach(node => {
        node.refAngle += angularVelocity;
        node.refAngle %= 2 * Math.PI; // Normalize the angle

        const intendedX = centerX + radius * Math.cos(node.refAngle);
        const intendedY = centerY + radius * Math.sin(node.refAngle);

        if (!node.dragging) {
            // Gradually move the node towards the intended position
            node.x = lerp(node.x, intendedX, 0.05);
            node.y = lerp(node.y, intendedY, 0.05);
        }
    });

    draw();
}

canvas.addEventListener('mousedown', mouseDown, false);
canvas.addEventListener('mouseup', mouseUp, false);
canvas.addEventListener('mousemove', mouseMove, false);

function mouseDown(e) {
    let mouseX = e.pageX - canvas.offsetLeft;
    let mouseY = e.pageY - canvas.offsetTop;

    // Check if central node is clicked
    if (mouseX >= centralNode.x && mouseX <= centralNode.x + centralNode.width &&
        mouseY >= centralNode.y && mouseY <= centralNode.y + centralNode.height) {
        centralNode.dragging = true;
        return;
    }

    // Check orbital nodes
    nodes.forEach(node => {
        if (mouseX >= node.x - node.width && mouseX <= node.x + node.width &&
            mouseY >= node.y - node.height && mouseY <= node.y + node.height) {
            node.dragging = true;
        }
    });
}

function mouseMove(e) {
    let mouseX = e.pageX - canvas.offsetLeft;
    let mouseY = e.pageY - canvas.offsetTop;

    if (centralNode.dragging) {
        centralNode.x = mouseX - centralNode.width / 2;
        centralNode.y = mouseY - centralNode.height / 2;
    } else {
        nodes.forEach(node => {
            if (node.dragging) {
                node.x = mouseX - node.width / 2;
                node.y = mouseY - node.height / 2;
            }
        });
    }
    draw();
}

function mouseUp() {
    centralNode.dragging = false;
    nodes.forEach(node => {
        node.dragging = false;
    });
}

function animate() {
    update();
    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

draw();