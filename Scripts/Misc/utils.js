function generateUUID() {
  return crypto.randomUUID();
}

function nearestMultiple(x, multiple) {
    return Math.round(x / multiple) * multiple;
  }

export { nearestMultiple, generateUUID};