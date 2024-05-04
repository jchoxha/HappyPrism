function Shape(x, y, width, height, type, numSides = 0) {
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

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const MAX_VELOCITY = 650;  // Maximum pixels per second
const shapes = [];

const centralShape = new Shape(canvas.width / 2 - 50, canvas.height / 2 - 50, 100, 100, 'square');
const radius = 200;
const angularVelocity = 0.001;
const center = { x: canvas.width / 2, y: canvas.height / 2 };
let angle = 0;

document.getElementById('addShape').addEventListener('click', () => addShape('circle'));
document.getElementById('removeShape').addEventListener('click', removeShape);

function addShape(type, numSides = 0) {
    const newAngle = 2 * Math.PI / (shapes.length + 1);
    shapes.forEach((shape, index) => {
        shape.angle = newAngle * index;
        shape.refAngle = newAngle * index;
    });

    const newShape = new Shape(
        centralShape.x + centralShape.width / 2 + radius * Math.cos(newAngle * shapes.length) - 75 / 2,
        centralShape.y + centralShape.height / 2 + radius * Math.sin(newAngle * shapes.length) - 75 / 2,
        75,
        75,
        type,
        numSides
    );
    newShape.angle = newAngle * shapes.length;
    newShape.refAngle = newAngle * shapes.length;
    shapes.push(newShape);
    updateShapes();
}

function removeShape() {
    if (shapes.length > 0) {
        shapes.pop();
        updateShapes();
    }
}

function updateShapes() {
    const angularSeparation = 2 * Math.PI / (shapes.length + 1);
    shapes.forEach((shape, index) => {
        shape.angle = angularSeparation * index;
        shape.refAngle = angularSeparation * index;
    });
    draw();
}

function drawShape(ctx, shape) {
    ctx.beginPath();
    if (shape.type === 'circle') {
        ctx.arc(shape.x, shape.y, shape.width / 2, 0, 2 * Math.PI);
    } else if (shape.type === 'polygon' && shape.numSides > 2) {
        const step = 2 * Math.PI / shape.numSides;
        const radius = shape.width / 2;
        ctx.moveTo(shape.x + radius, shape.y);
        for (let i = 1; i <= shape.numSides; i++) {
            ctx.lineTo(shape.x + radius * Math.cos(step * i), shape.y + radius * Math.sin(step * i));
        }
    }
    ctx.closePath();
    ctx.fill();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'red';
    ctx.fillRect(centralShape.x, centralShape.y, centralShape.width, centralShape.height);
    ctx.beginPath();
    ctx.setLineDash([5, 15]);
    ctx.strokeStyle = 'gray';
    ctx.arc(centralShape.x + centralShape.width / 2, centralShape.y + centralShape.height / 2, radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'blue';
    shapes.forEach(shape => drawShape(ctx, shape));
}


function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}

function update() {
    const centerX = centralShape.x + centralShape.width / 2;
    const centerY = centralShape.y + centralShape.height / 2;

    shapes.forEach(shape => {
        shape.refAngle += angularVelocity;
        shape.refAngle %= 2 * Math.PI; // Normalize the angle

        const intendedX = centerX + radius * Math.cos(shape.refAngle);
        const intendedY = centerY + radius * Math.sin(shape.refAngle);

        if (!shape.dragging) {
            // Gradually move the shape towards the intended position
            shape.x = lerp(shape.x, intendedX, 0.05);
            shape.y = lerp(shape.y, intendedY, 0.05);
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

    // Check if central shape is clicked
    if (mouseX >= centralShape.x && mouseX <= centralShape.x + centralShape.width &&
        mouseY >= centralShape.y && mouseY <= centralShape.y + centralShape.height) {
        centralShape.dragging = true;
        return;
    }

    // Check orbital shapes
    shapes.forEach(shape => {
        const dx = mouseX - (shape.x + shape.width / 2);
        const dy = mouseY - (shape.y + shape.height / 2);
        if (Math.sqrt(dx * dx + dy * dy) <= shape.width / 2) {
            shape.dragging = true;
        }
    });
}

function mouseMove(e) {
    let mouseX = e.pageX - canvas.offsetLeft;
    let mouseY = e.pageY - canvas.offsetTop;

    if (centralShape.dragging) {
        centralShape.x = mouseX - centralShape.width / 2;
        centralShape.y = mouseY - centralShape.height / 2;
    } else {
        shapes.forEach(shape => {
            if (shape.dragging) {
                shape.x = mouseX - shape.width / 2;
                shape.y = mouseY - shape.height / 2;
            }
        });
    }
    draw();
}

function mouseUp() {
    centralShape.dragging = false;
    shapes.forEach(shape => {
        shape.dragging = false;
    });
}

function animate() {
    update();
    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

draw();
