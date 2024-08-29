import { colors, shadowOffset } from "./constants";

export type Bullet = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  r: number;
  dead: boolean;
};

export function updateBullet(bullet: Bullet, dt: number) {
  const speed = 100;
  if (bullet.dead) return;
  bullet.x += (bullet.dx * dt * speed) / 1000;
  bullet.y += (bullet.dy * dt * speed) / 1000;
}

export function drawBullet(ctx: CanvasRenderingContext2D, bullet: Bullet) {
  ctx.fillStyle = "#ccc";
  ctx.beginPath();
  ctx.arc(bullet.x, bullet.y, 1, 0, Math.PI * 2);
  ctx.fill();
}

export function drawBulletShadow(
  ctx: CanvasRenderingContext2D,
  bullet: Bullet,
) {
  ctx.fillStyle = colors[0];
  ctx.beginPath();
  ctx.arc(bullet.x + shadowOffset, bullet.y + shadowOffset, 1, 0, Math.PI * 2);
  ctx.fill();
}
