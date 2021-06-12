export function toRadian(deg) {
  return deg * (Math.PI / 180);
}

export function toDegree(rad) {
  return rad * (180 / Math.PI);
}

export function clamp(value, min, max) {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}
