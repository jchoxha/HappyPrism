document.addEventListener('DOMContentLoaded', function() {
  // Initialize Fabric.js canvas
  const canvas = new fabric.Canvas('canvas', {
      width: 800,
      height: 600,
      backgroundColor: 'lightgrey'
  });

  // Create a central node
  const centralNode = new fabric.Circle({
      radius: 50,
      fill: 'red',
      left: canvas.width / 2 - 50,  // Center the node
      top: canvas.height / 2 - 50,
      hasControls: false,  // Disable scaling controls
      hasBorders: false    // Disable selection borders
  });

  centralNode.set({
      selectable: true,
      lockMovementX: false,
      lockMovementY: false
  });

  // Add central node to canvas
  canvas.add(centralNode);

  // Update and render loop for animations (if needed)
  function animate() {
      // Here you can handle physics or other animations
      canvas.renderAll();
      fabric.util.requestAnimFrame(animate);
  }

  fabric.util.requestAnimFrame(animate);

  // Example function to add new nodes on button click
  document.getElementById('addNode').addEventListener('click', function() {
      addNode();
  });

  function addNode() {
      const node = new fabric.Circle({
          radius: 30,
          fill: 'blue',
          left: Math.random() * (canvas.width - 60),  // Random position avoiding edges
          top: Math.random() * (canvas.height - 60),
          hasControls: false,
          hasBorders: false
      });

      canvas.add(node);
  }
});
