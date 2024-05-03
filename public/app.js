const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const MAX_VELOCITY = 650;  // Maximum pixels per second

let shapes = [
    { x: 100, y: 100, width: 75, height: 75, vx: 0, vy: 0, angle: 0, refAngle: 0, dragging: false },
    { x: 300, y: 100, width: 75, height: 75, vx: 0, vy: 0, angle: Math.PI, refAngle: Math.PI, dragging: false }
];

document.getElementById('addShape').addEventListener('click', () => {
    addShape();
});

document.getElementById('removeShape').addEventListener('click', () => {
    removeShape();
});

function addShape() {
    const newAngle = 2 * Math.PI / (shapes.length + 1);
    shapes.forEach((shape, index) => {
        shape.angle = newAngle * index;
        shape.refAngle = newAngle * index;
    });

    shapes.push({
        x: center.x + radius * Math.cos(newAngle * shapes.length) - 75 / 2,
        y: center.y + radius * Math.sin(newAngle * shapes.length) - 75 / 2,
        width: 75,
        height: 75,
        vx: 0,
        vy: 0,
        angle: newAngle * shapes.length,
        refAngle: newAngle * shapes.length,
        dragging: false
    });

    updateShapes();
}

function removeShape() {
    if (shapes.length > 0) {
        shapes.pop();
        updateShapes();
    }
}

function updateShapes() {
    const angularSeparation = 2 * Math.PI / shapes.length;
    shapes.forEach((shape, index) => {
        shape.angle = angularSeparation * index;
        shape.refAngle = angularSeparation * index;
    });
    draw();
}

const center = { x: canvas.width / 2, y: canvas.height / 2 };
const radius = 200;
let angle = 0;
const angularVelocity = 0.001;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.setLineDash([5, 15]);
    ctx.strokeStyle = 'gray';
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'blue';

    shapes.forEach(shape => {
        ctx.beginPath();
        ctx.arc(shape.x + shape.width / 2, shape.y + shape.height / 2, shape.width / 2, 0, Math.PI * 2);
        ctx.fill();
    });
}

function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}

function update() {
    shapes.forEach(shape => {
        shape.refAngle += angularVelocity;
        shape.refAngle %= 2 * Math.PI; // Normalize the angle

        const intendedX = center.x + radius * Math.cos(shape.refAngle) - shape.width / 2;
        const intendedY = center.y + radius * Math.sin(shape.refAngle) - shape.height / 2;

        if (!shape.dragging) {
            // Gradually move the shape towards the intended position
            shape.x = lerp(shape.x, intendedX, 0.05);  // Smoothly interpolate X position
            shape.y = lerp(shape.y, intendedY, 0.05);  // Smoothly interpolate Y position
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

    shapes.forEach(shape => {
        const distance = Math.sqrt(Math.pow((mouseX - (shape.x + shape.width / 2)), 2) + Math.pow((mouseY - (shape.y + shape.height / 2)), 2));
        if (distance <= shape.width / 2) {
            shape.dragging = true;
            return;
        }
    });
}

function mouseMove(e) {
    let mouseX = e.pageX - canvas.offsetLeft;
    let mouseY = e.pageY - canvas.offsetTop;

    shapes.forEach(shape => {
        if (shape.dragging) {
            shape.x = mouseX - shape.width / 2;
            shape.y = mouseY - shape.height / 2;
        }
    });

    draw();
}

function mouseUp() {
    shapes.forEach(shape => {
        if (shape.dragging) {
            shape.dragging = false;
            // The update function will take over to smoothly transition the shape back to the orbit
        }
    });
}

function animate() {
    update();
    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

draw();
