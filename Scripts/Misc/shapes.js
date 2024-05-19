// shapes.js
const ShapeType = {
    CIRCLE: { name: 'circle', numSides: 1, isPolygon: false },
    TRIANGLE: { name: 'triangle', numSides: 3, isPolygon: true },
    SQUARE: { name: 'square', numSides: 4, isPolygon: true },
    PENTAGON: { name: 'pentagon', numSides: 5, isPolygon: true },
    HEXAGON: { name: 'hexagon', numSides: 6, isPolygon: true },
    SEPTAGON: { name: 'septagon', numSides: 7, isPolygon: true },
    OCTAGON: { name: 'octagon', numSides: 8, isPolygon: true },
    NONAGON: { name: 'nonagon', numSides: 9, isPolygon: true }
};

export { ShapeType };
