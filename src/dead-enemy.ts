type DeadEnemy = {
  timeToSpawn: 3000;
  x: number;
  y: number;
  radius: number;
  dx: number;
  dy: number;
  life: number;
};

export function createDeadEnemy(x: number, y: number, dx: number, dy: number) {
  return {
    timeToSpawn: 3000,
    x,
    y,
    radius: 3,
    dx,
    dy,
    life: 3000,
  };
}
