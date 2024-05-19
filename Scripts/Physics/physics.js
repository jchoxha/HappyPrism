// --Physics.js-- //
import { detectAndHandleCollisions } from './collision.js';

//~~~~Global Properties~~~~//
const deceleration = 0.95;
const gravityStrength = 0.005;

//~~~~Physics Functions~~~~//
function physicsUpdate(canvasManager) {
    const nodes = canvasManager.nodes;

    nodes.forEach(node => {
        let collisionDetected = false;
        collisionDetected = detectAndHandleCollisions(nodes, node);
        // If this node is being dragged, do not further simulate physics
        if (!node.dragging) {
            if ((node.inMovementAfterDragging || node.inMovementAfterCollision) && !node.inOrbit) {
                // Apply velocity to position
                node.x += node.vx;
                node.y += node.vy;

                // Apply gravitational force if the position is fixed
                if (node.positionFixed) {
                    applyGravitationalForce(node);
                }

                // Apply deceleration to velocity
                node.vx *= deceleration;
                node.vy *= deceleration;

                // Stop the node if velocity is very low
                if (Math.abs(node.vx) < 0.001 && Math.abs(node.vy) < 0.001) {
                    if (node.positionFixed) {
                        node.x = node.fixedX;
                        node.y = node.fixedY;
                    } else {
                        node.intendedX = node.x;
                        node.intendedY = node.y;
                    }
                    node.vx = 0;
                    node.vy = 0;
                    node.inMovementAfterDragging = false;
                    node.inMovementAfterCollision = false;
                    console.log("Movement after dragging complete for: " + node);
                }
                return;
            }
            node.x = lerp(node.x, node.intendedX, 0.2);  // Increase the lerp factor for faster response
            node.y = lerp(node.y, node.intendedY, 0.2);  // Increase the lerp factor for faster response
        }
    });
}

function applyGravitationalForce(node) {
    const distanceX = node.fixedX - node.x;
    const distanceY = node.fixedY - node.y;

    // Calculate the force based on distance
    const forceX = distanceX * gravityStrength;
    const forceY = distanceY * gravityStrength;

    // Apply the force to the node's velocity
    node.vx += forceX;
    node.vy += forceY;
}

//~~~~Movement~~~~//
function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}
export { physicsUpdate };
