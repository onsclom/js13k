import { colors, shadowOffset } from "./constants";

export type Bullet = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  r: number;
  dead: boolean;
  particleTimer: number;
  particles: {
    x: number;
    y: number;
    r: number;
    life: number;
    angle: number;
    speed: number;
  }[];
};

const particleSpawnRate = 10;

export function createBullet(x: number, y: number, angle: number) {
  return {
    x,
    y,
    dx: Math.cos(angle),
    dy: Math.sin(angle),
    r: 1.5,
    dead: false,
    particles: [] as Bullet["particles"],
    particleTimer: 0,
  };
}

const particleLifetime = 500;
export function updateBullet(bullet: Bullet, dt: number) {
  const speed = 100;
  if (bullet.dead) return;
  bullet.x += (bullet.dx * dt * speed) / 1000;
  bullet.y += (bullet.dy * dt * speed) / 1000;

  for (const particle of bullet.particles) {
    particle.life -= dt;
    particle.x += Math.cos(particle.angle) * particle.speed * (dt / 1000);
    particle.y += Math.sin(particle.angle) * particle.speed * (dt / 1000);
  }
  for (let i = bullet.particles.length - 1; i >= 0; i--) {
    if (bullet.particles[i].life <= 0) {
      bullet.particles.splice(i, 1);
    }
  }

  bullet.particleTimer += dt;
  while (bullet.particleTimer >= particleSpawnRate) {
    bullet.particles.push({
      x: bullet.x,
      y: bullet.y,
      r: bullet.r / 2,
      life: particleLifetime,
      angle: Math.random() * Math.PI * 2,
      speed: Math.random() * 10,
    });
    bullet.particleTimer -= particleSpawnRate;
  }
}

export function drawBullet(ctx: CanvasRenderingContext2D, bullet: Bullet) {
  ctx.fillStyle = "#ccc";
  drawBulletShape(ctx, bullet);
}

export function drawBulletShape(ctx: CanvasRenderingContext2D, bullet: Bullet) {
  ctx.beginPath();
  ctx.arc(bullet.x, bullet.y, bullet.r, 0, Math.PI * 2);
  ctx.fill();
  for (const particle of bullet.particles) {
    ctx.beginPath();
    // shrink over lifetime
    ctx.arc(
      particle.x,
      particle.y,
      particle.r * (particle.life / particleLifetime),
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}

export function drawBulletShadow(
  ctx: CanvasRenderingContext2D,
  bullet: Bullet,
) {
  ctx.fillStyle = colors[0];
  ctx.translate(shadowOffset, shadowOffset);
  drawBulletShape(ctx, bullet);
  ctx.translate(-shadowOffset, -shadowOffset);
}
