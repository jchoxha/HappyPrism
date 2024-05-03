const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const MAX_VELOCITY = 650;  // Maximum pixels per second

let spheres = [
    { x: 100, y: 100, width: 75, height: 75, vx: 0, vy: 0, angle: 0, refAngle: 0, dragging: false },
    { x: 300, y: 100, width: 75, height: 75, vx: 0, vy: 0, angle: Math.PI, refAngle: Math.PI, dragging: false }
];



let rect = { x: 100, y: 100, width: 150, height: 100, vx: 0, vy: 0 };
let drag = false;
let mousePositions = [];
let draggingStartedWithinRectangle = false;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.setLineDash([5, 15]);
    ctx.strokeStyle = 'gray';
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'blue';

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
            sphere.dragging = false;
            // Velocity will be recalculated in the update function
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
        // Update reference angle continuously
        sphere.refAngle += angularVelocity;
        sphere.refAngle %= 2 * Math.PI;  // Normalize angle

        // Calculate the intended position from the reference angle
        const intendedX = center.x + radius * Math.cos(sphere.refAngle) - sphere.width / 2;
        const intendedY = center.y + radius * Math.sin(sphere.refAngle) - sphere.height / 2;

        if (!sphere.dragging) {
            // Gradually move the sphere towards the intended position
            if (Math.hypot(sphere.x - intendedX, sphere.y - intendedY) > 1) {
                sphere.vx = (intendedX - sphere.x) * 0.1; // Smoother transition
                sphere.vy = (intendedY - sphere.y) * 0.1;
            } else {
                // Snap to the intended position if very close
                sphere.x = intendedX;
                sphere.y = intendedY;
                sphere.vx = 0;
                sphere.vy = 0;
            }

            sphere.x += sphere.vx;
            sphere.y += sphere.vy;

            // Update angle to match the position
            sphere.angle = Math.atan2(sphere.y + sphere.width / 2 - center.y, sphere.x + sphere.width / 2 - center.x);
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
