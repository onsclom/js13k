import { colors } from "./constants";

export type DeadEnemy = {
  timeToSpawn: 3000;
  x: number;
  y: number;
  radius: number;
  dx: number;
  dy: number;
  life: number;
  text: string;
};

const lifetime = 500;

export function createDeadEnemy(
  x: number,
  y: number,
  radius: number,
  text: string,
): DeadEnemy {
  return {
    timeToSpawn: 3000,
    x,
    y,
    radius,
    dx: Math.random() - 0.5,
    dy: -3,
    life: lifetime,
    text,
  };
}

export function updateDeadEnemy(deadEnemy: DeadEnemy, dt: number) {
  const gravity = 9.8;
  deadEnemy.dy += (gravity * dt) / 1000;

  deadEnemy.x += (deadEnemy.dx * dt * 20) / 1000;
  deadEnemy.y += (deadEnemy.dy * dt * 20) / 1000;
  deadEnemy.life -= dt;
}

export function drawDeadEnemy(
  ctx: CanvasRenderingContext2D,
  deadEnemy: DeadEnemy,
) {
  // fade out over lifetime
  ctx.globalAlpha = deadEnemy.life / lifetime;
  ctx.fillStyle = colors[1];
  ctx.beginPath();
  ctx.arc(deadEnemy.x, deadEnemy.y, deadEnemy.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = colors[0];
  ctx.font =
    "3px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(deadEnemy.text, deadEnemy.x, deadEnemy.y);
  ctx.globalAlpha = 1;
}
