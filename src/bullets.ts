import { colors, shadowOffset } from "./constants";

export type Bullets = {
  projectiles: Bullet[];
  particles: Particle[];
};

export type Particle = {
  x: number;
  y: number;
  r: number;
  life: number;
  angle: number;
  speed: number;
};

export type Bullet = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  r: number;
  dead: boolean;
  particleTimer: number;
};

const particleSpawnRate = 10;
const particleLifetime = 500;

export function createBullets() {
  return {
    projectiles: [] as Bullet[],
    particles: [] as Particle[],
  };
}

export function createBullet(
  bullets: Bullets,
  x: number,
  y: number,
  angle: number,
) {
  bullets.projectiles.push({
    x,
    y,
    dx: Math.cos(angle),
    dy: Math.sin(angle),
    r: 1.5,
    dead: false,
    particleTimer: 0,
  });
}

function updateBullet(bullet: Bullet, dt: number) {
  const speed = 100;
  if (!bullet.dead) {
    bullet.x += (bullet.dx * dt * speed) / 1000;
    bullet.y += (bullet.dy * dt * speed) / 1000;
  }
}

export function updateBullets(bullets: Bullets, dt: number) {
  for (const bullet of bullets.projectiles) {
    updateBullet(bullet, dt);
    bullet.particleTimer += dt;
    while (bullet.particleTimer >= particleSpawnRate) {
      bullets.particles.push({
        x: bullet.x,
        y: bullet.y,
        r: bullet.r / 2,
        life: particleLifetime,
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 7,
      });
      bullet.particleTimer -= particleSpawnRate;
    }
  }

  for (const particle of bullets.particles) {
    particle.life -= dt;
    particle.x += Math.cos(particle.angle) * particle.speed * (dt / 1000);
    particle.y += Math.sin(particle.angle) * particle.speed * (dt / 1000);
    particle.r -= (particle.r / particleLifetime) * dt;
  }

  for (let i = bullets.particles.length - 1; i >= 0; i--) {
    if (bullets.particles[i].life <= 0) {
      bullets.particles.splice(i, 1);
    }
  }
}

function drawBulletShape(ctx: CanvasRenderingContext2D, bullet: Bullet) {
  ctx.beginPath();
  ctx.arc(bullet.x, bullet.y, bullet.r, 0, Math.PI * 2);
  ctx.fill();
}

export function drawBullets(bullets: Bullets, ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#ddf";
  drawParticles(ctx, bullets.particles);
  ctx.fillStyle = "#88a";
  for (const bullet of bullets.projectiles) drawBulletShape(ctx, bullet);
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (const particle of particles) {
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawBulletsShadows(
  bullets: Bullets,
  ctx: CanvasRenderingContext2D,
) {
  ctx.fillStyle = colors[0];
  ctx.translate(shadowOffset, shadowOffset);
  drawParticles(ctx, bullets.particles);
  for (const bullet of bullets.projectiles) {
    drawBulletShape(ctx, bullet);
  }
  ctx.translate(-shadowOffset, -shadowOffset);
}
