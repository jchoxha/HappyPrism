const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const MAX_VELOCITY = 650;  // Maximum pixels per second

let spheres = [
    { x: 100, y: 100, width: 75, height: 75, vx: 0, vy: 0, angle: 0, dragging: false }, // Initial sphere
    { x: 300, y: 100, width: 75, height: 75, vx: 0, vy: 0, angle: Math.PI, dragging: false } // Second sphere
];


let rect = { x: 100, y: 100, width: 150, height: 100, vx: 0, vy: 0 };
let drag = false;
let mousePositions = [];
let draggingStartedWithinRectangle = false;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the orbital path
    ctx.beginPath();
    ctx.setLineDash([5, 15]);  // Set the dash pattern for dotted line
    ctx.strokeStyle = 'gray';  // Color of the orbital path
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);  // Draw a full circle
    ctx.stroke();

    // Reset dash to solid line for other drawings
    ctx.setLineDash([]);
    ctx.fillStyle = 'blue';

    // Draw each sphere
    spheres.forEach(sphere => {
        ctx.beginPath();
        ctx.arc(sphere.x + sphere.width / 2, sphere.y + sphere.height / 2, sphere.width / 2, 0, Math.PI * 2);
        ctx.fill();
    });
}



//Orbit
const center = { x: canvas.width / 2, y: canvas.height / 2 };
const radius = 200;
let angle = 0;
const angularVelocity = 0.001;  // Radians per frame


function mouseDown(e) {
    let mouseX = e.pageX - canvas.offsetLeft;
    let mouseY = e.pageY - canvas.offsetTop;

    spheres.forEach(sphere => {
        const distance = Math.sqrt(Math.pow((mouseX - (sphere.x + sphere.width / 2)), 2) + Math.pow((mouseY - (sphere.y + sphere.height / 2)), 2));
        if (distance <= sphere.width / 2) {
            sphere.dragging = true; // Mark this sphere as being dragged
            mousePositions = [];
            trackMousePosition(e);
            return; // Stop checking other spheres once one has been selected
        }
    });
}


function mouseUp() {
    spheres.forEach(sphere => {
        if (sphere.dragging) {
            calculateVelocity(sphere);
            sphere.dragging = false;
            // Recalculate velocity based on the new angle to smoothly reintegrate into orbit
            sphere.vx = angularVelocity * -Math.sin(sphere.angle) * radius;
            sphere.vy = angularVelocity * Math.cos(sphere.angle) * radius;
        }
    });
}

function mouseMove(e) {
    let mouseX = e.pageX - canvas.offsetLeft;
    let mouseY = e.pageY - canvas.offsetTop;

    spheres.forEach(sphere => {
        if (sphere.dragging) {
            sphere.x = mouseX - sphere.width / 2;
            sphere.y = mouseY - sphere.height / 2;
            // Calculate new angle based on the new position
            sphere.angle = Math.atan2(sphere.y + sphere.width / 2 - center.y, sphere.x + sphere.width / 2 - center.x);
            draw();
        }
    });
}

function trackMousePosition(e) {
    let mouseX = e.pageX - canvas.offsetLeft;
    let mouseY = e.pageY - canvas.offsetTop;
    mousePositions.push({ x: mouseX, y: mouseY, time: Date.now() });

    if (mousePositions.length > 5) {
        mousePositions.shift();
    }
}

function calculateVelocity(sphere) {
    if (mousePositions.length > 1) {
        let first = mousePositions[0];
        let last = mousePositions[mousePositions.length - 1];
        let timeDelta = (last.time - first.time) / 1000;
        if (timeDelta > 0) {
            let vx = (last.x - first.x) / timeDelta;
            let vy = (last.y - first.y) / timeDelta;
            let speed = Math.sqrt(vx * vx + vy * vy);
            if (speed > MAX_VELOCITY) {
                let scaleFactor = MAX_VELOCITY / speed;
                vx *= scaleFactor;
                vy *= scaleFactor;
            }
            sphere.vx = vx;
            sphere.vy = vy;
        }
    }
}

function update() {
    spheres.forEach(sphere => {
        if (!sphere.dragging) {
            const intendedX = center.x + radius * Math.cos(sphere.angle) - sphere.width / 2;
            const intendedY = center.y + radius * Math.sin(sphere.angle) - sphere.height / 2;

            sphere.x += (intendedX - sphere.x) * 0.05;
            sphere.y += (intendedY - sphere.y) * 0.05;
            sphere.angle += angularVelocity;
        }
    });

    draw();
}




canvas.addEventListener('mousedown', mouseDown, false);
canvas.addEventListener('mouseup', mouseUp, false);
canvas.addEventListener('mousemove', mouseMove, false);

function animate() {
    update();
    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

draw();
