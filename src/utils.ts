// [min, max)
export function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function randomChoice<T>(choices: T[]): T {
  return choices[Math.floor(Math.random() * choices.length)];
}

type Point = {
  x: number;
  y: number;
};

export function closestIntersectionPoint(
  p1: Point,
  p2: Point,
  circleCenter: Point,
  radius: number,
): Point | null {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  const fx = p1.x - circleCenter.x;
  const fy = p1.y - circleCenter.y;

  const a = dx * dx + dy * dy;
  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - radius * radius;

  let discriminant = b * b - 4 * a * c;

  if (discriminant < 0) {
    // No intersection
    return null;
  } else {
    // Line intersects the circle
    discriminant = Math.sqrt(discriminant);

    const t1 = (-b - discriminant) / (2 * a);
    const t2 = (-b + discriminant) / (2 * a);

    let intersection1: Point | null = null;
    let intersection2: Point | null = null;

    if (t1 >= 0 && t1 <= 1) {
      intersection1 = {
        x: p1.x + t1 * dx,
        y: p1.y + t1 * dy,
      };
    }

    if (t2 >= 0 && t2 <= 1) {
      intersection2 = {
        x: p1.x + t2 * dx,
        y: p1.y + t2 * dy,
      };
    }

    // Return the closest intersection point to p1
    if (intersection1 && intersection2) {
      const dist1 =
        (intersection1.x - p1.x) ** 2 + (intersection1.y - p1.y) ** 2;
      const dist2 =
        (intersection2.x - p1.x) ** 2 + (intersection2.y - p1.y) ** 2;
      return dist1 < dist2 ? intersection1 : intersection2;
    } else if (intersection1) {
      return intersection1;
    } else if (intersection2) {
      return intersection2;
    } else {
      return null;
    }
  }
}
