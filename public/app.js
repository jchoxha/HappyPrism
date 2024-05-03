const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const MAX_VELOCITY = 650;  // Maximum pixels per second

let spheres = [
    { x: 100, y: 100, width: 75, height: 75, vx: 0, vy: 0, angle: 0, refAngle: 0, dragging: false },
    { x: 300, y: 100, width: 75, height: 75, vx: 0, vy: 0, angle: Math.PI, refAngle: Math.PI, dragging: false }
];

document.getElementById('addSphere').addEventListener('click', () => {
    addSphere();
});

document.getElementById('removeSphere').addEventListener('click', () => {
    removeSphere();
});

function addSphere() {
    const newAngle = 2 * Math.PI / (spheres.length + 1); // Calculate even spacing for new sphere
    spheres.forEach((sphere, index) => {
        sphere.angle = newAngle * index; // Reassign existing angles
        sphere.refAngle = newAngle * index;
    });

    // Add new sphere at opposite angle
    spheres.push({
        x: center.x + radius * Math.cos(newAngle * spheres.length) - 75 / 2,
        y: center.y + radius * Math.sin(newAngle * spheres.length) - 75 / 2,
        width: 75,
        height: 75,
        vx: 0,
        vy: 0,
        angle: newAngle * spheres.length,
        refAngle: newAngle * spheres.length,
        dragging: false
    });

    updateSpheres(); // Update the canvas immediately
}

function removeSphere() {
    if (spheres.length > 1) {
        spheres.pop(); // Remove last sphere
        updateSpheres(); // Update the canvas immediately
    }
}

function updateSpheres() {
    const angularSeparation = 2 * Math.PI / spheres.length;
    spheres.forEach((sphere, index) => {
        sphere.angle = angularSeparation * index;
        sphere.refAngle = angularSeparation * index;
    });
    draw();
}

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
            // No need to set velocities here, let the update function handle the smooth transition
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

function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}

function update() {
    spheres.forEach(sphere => {
        // Update reference angle continuously
        sphere.refAngle += angularVelocity;
        sphere.refAngle %= 2 * Math.PI;  // Normalize angle

        const intendedX = center.x + radius * Math.cos(sphere.refAngle) - sphere.width / 2;
        const intendedY = center.y + radius * Math.sin(sphere.refAngle) - sphere.height / 2;

        if (!sphere.dragging) {
            // Gradually move the sphere towards the intended position
            sphere.x = lerp(sphere.x, intendedX, 0.05);  // Adjust the 0.05 as needed to smooth or speed up the transition
            sphere.y = lerp(sphere.y, intendedY, 0.05);
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
