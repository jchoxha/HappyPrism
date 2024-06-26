import { Logger } from "../Debug/logger.js";

function detectAndHandleCollisions(nodes, currentNode) {
    let collisionOccurred = false;
    nodes.forEach(node => {
        if (node!= currentNode){
            if (checkCollision(currentNode, node)) {
            Logger.log("Collision detected between: " + currentNode + " and " + node);
            handleCollision(currentNode, node);
                collisionOccurred = true; 
            }
        }
    });
    return collisionOccurred;
}

function handleCollision(node1, node2) {

    if (node1.x == node2.x && node1.y == node2.y) {
        node1.x += node2.size / 2;
        node1.y += node2.size / 2;
        node2.x -= node1.size / 2;
        node2.y -= node1.size / 2;
        return;
    }
    const dx = node1.x - node2.x;
    const dy = node1.y - node2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const totalRadius = (node1.size / 2) + (node2.size / 2);

    // Calculate overlap
    const overlap = totalRadius - distance;
    const displacementX = (overlap * (dx / distance)) / 2;
    const displacementY = (overlap * (dy / distance)) / 2;

    // Calculate mass based on node size
    const mass1 = node1.size;
    const mass2 = node2.size;
    const totalMass = mass1 + mass2;

    // Calculate new velocities based on momentum conservation for elastic collision
    const newVx1 = (node1.vx * (mass1 - mass2) + (2 * mass2 * node2.vx)) / totalMass;
    const newVy1 = (node1.vy * (mass1 - mass2) + (2 * mass2 * node2.vy)) / totalMass;
    const newVx2 = (node2.vx * (mass2 - mass1) + (2 * mass1 * node1.vx)) / totalMass;
    const newVy2 = (node2.vy * (mass2 - mass1) + (2 * mass1 * node1.vy)) / totalMass;

    // Apply displacement to avoid overlapping and ensure an immediate bounce
    if (!node1.dragging && !node1.isResizing) {
        node1.inMovementAfterCollision = true;
        node1.vx = newVx1;
        node1.vy = newVy1;
        node1.x += displacementX;
        node1.y += displacementY;
    }
    if (!node2.dragging && !node2.isResizing) {
        node2.inMovementAfterCollision = true;
        node2.vx = newVx2;
        node2.vy = newVy2;
        node2.x -= displacementX;
        node2.y -= displacementY;
    }
}

//~~~~Collision Functions~~~~//

function checkCollision(node1, node2) {
    const shape1 = node1.shapeType;
    const shape2 = node2.shapeType;

    if (shape1.name === 'circle' && shape2.name === 'circle') {
        return circleCircleCollision(node1, node2);
    } else if ((shape1.name === 'circle' && shape2.isPolygon) || (shape2.name === 'circle' && shape1.isPolygon)) {
        return circlePolygonCollision(node1, node2);
    } else if (shape1.isPolygon && shape2.isPolygon) {
        return polygonPolygonCollision(node1, node2);
    } else {
        return boundingCircleCollision(node1, node2);  // Default check for undefined or complex shapes
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



function circleCircleCollision(node1, node2) {
    const dx = node1.x - node2.x;
    const dy = node1.y - node2.y;
    const totalSizeOfNodes = node1.size + node2.size;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const totalRadius = totalSizeOfNodes / 2;

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

export { detectAndHandleCollisions};