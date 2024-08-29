import { gameArea, colors } from "./constants";
import { randomBetween, randomChoice } from "./utils";

export function createEnemy() {
  if (Math.random() < 0.5) {
    return createNumberEnemy();
  } else {
    return createMathEnemy();
  }
}

export function createMathEnemy() {
  const enemyRadius = 5;
  const randAngle = Math.random() * Math.PI * 2;
  const number = Math.random() > 0.5 ? 13 : randomChoice([11, 12, 14, 15]);
  // make a simple math problem that solves to the number
  const add = Math.round(randomBetween(-9, 9));
  const text = add >= 0 ? `${number - add}+${add}` : `${number - add}-${-add}`;

  return {
    timeToSpawn: 3000,
    x: randomBetween(enemyRadius, gameArea.width - enemyRadius),
    y: randomBetween(enemyRadius, gameArea.height - enemyRadius),
    radius: enemyRadius,
    dx: Math.cos(randAngle),
    dy: Math.sin(randAngle),
    number,
    text,
  };
}

export function createNumberEnemy() {
  const enemyRadius = 3;
  const randAngle = Math.random() * Math.PI * 2;
  const number = randomChoice([13, 14, 15]);
  return {
    timeToSpawn: 3000,
    x: randomBetween(enemyRadius, gameArea.width - enemyRadius),
    y: randomBetween(enemyRadius, gameArea.height - enemyRadius),
    radius: enemyRadius,
    dx: Math.cos(randAngle),
    dy: Math.sin(randAngle),
    number,
    text: number.toString(),
  };
}

export function updateEnemy(enemy: ReturnType<typeof createEnemy>, dt: number) {
  enemy.timeToSpawn -= dt;
  if (enemy.timeToSpawn > 0) return;
  const speed = 20;
  enemy.x += (enemy.dx * dt * speed) / 1000;
  enemy.y += (enemy.dy * dt * speed) / 1000;

  if (enemy.x - enemy.radius < 0) {
    enemy.x = enemy.radius;
    enemy.dx = Math.abs(enemy.dx);
  } else if (enemy.x + enemy.radius > gameArea.width) {
    enemy.x = gameArea.width - enemy.radius;
    enemy.dx = -Math.abs(enemy.dx);
  }
  if (enemy.y - enemy.radius < 0) {
    enemy.y = enemy.radius;
    enemy.dy = Math.abs(enemy.dy);
  } else if (enemy.y + enemy.radius > gameArea.height) {
    enemy.y = gameArea.height - enemy.radius;
    enemy.dy = -Math.abs(enemy.dy);
  }

  return enemy;
}

export function drawEnemy(
  ctx: CanvasRenderingContext2D,
  enemy: ReturnType<typeof createEnemy>,
) {
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
  ctx.beginPath();
  ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = colors[1];
  ctx.beginPath();
  ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = colors[0];
  ctx.font =
    "3px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(enemy.text, enemy.x, enemy.y);
  ctx.restore();

  ctx.save();
  const progress = Math.min(1, 1 - enemy.timeToSpawn / 3000);
  ctx.beginPath();
  ctx.moveTo(enemy.x, enemy.y); // Move to the center of the arc
  ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2 * progress);
  ctx.closePath(); // Close the path to create a pie-like segment
  ctx.clip();

  ctx.fillStyle = colors[1];
  ctx.beginPath();
  ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = colors[0];
  ctx.font =
    "3px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(enemy.text, enemy.x, enemy.y);

  if (enemy) {
    // apply a black tint over the enemy
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
