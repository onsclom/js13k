import { drawBullet, updateBullet, Bullet, drawBulletShadow } from "./bullet";
import { gameArea, colors, shadowOffset } from "./constants";
import { createEnemy, drawEnemy, updateEnemy } from "./enemy";
import { gameAreaInScreenSpace } from "./utils";
import { keysDown, cursor } from "./input";

// CONSTANTS
const playerRadius = 2;
const enemySpawnRate = 1000;
const speed = 20;
const leftKeys = ["ArrowLeft", "a"];
const rightKeys = ["ArrowRight", "d"];
const upKeys = ["ArrowUp", "w"];
const downKeys = ["ArrowDown", "s"];

let state = {
  player: {
    x: gameArea.width / 2,
    y: gameArea.height / 2,
    radius: playerRadius,
    dead: false,
  },
  bullets: [] as Bullet[],
  enemies: [] as ReturnType<typeof createEnemy>[],
  deadEnemies: [] as ReturnType<typeof createEnemy>[],
  spawnTimer: 0,
};

export function update(dt: number) {
  if (state.player.dead) return;
  handlePlayerMovement(dt);
  handleSpawningEnemies(dt);
  if (cursor.clicked) handleShoot();
  updateEnemies(dt);
  state.bullets.forEach((bullet) => updateBullet(bullet, dt));
  constrainBulletAmount();
  handleBulletsTouchingEnemies();
  handlePlayerTouchingEnemies();
}
export function draw(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  const drawingRect = canvas.getBoundingClientRect();
  const { xScale, yScale } = gameAreaInScreenSpace(canvas);
  drawLetterBoxing(ctx, canvas, drawingRect, xScale, yScale);
  drawDeadEnemies(ctx);
  drawPlayerShadow(ctx);
  drawEnemyShadows(ctx);
  state.bullets.forEach((bullet) => drawBulletShadow(ctx, bullet));
  drawEnemies(ctx);
  drawPlayer(ctx);
  state.bullets.forEach((bullet) => drawBullet(ctx, bullet));
  if (state.player.dead) drawGameOverScreen(ctx);
}

function handlePlayerTouchingEnemies() {
  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const enemy = state.enemies[i];
    if (enemy.timeToSpawn >= 0) continue;
    const dist = Math.sqrt(
      (enemy.x - state.player.x) ** 2 + (enemy.y - state.player.y) ** 2,
    );
    if (dist < playerRadius + enemy.radius) {
      if (enemy.number !== 13) {
        state.deadEnemies.push(enemy);
        const dead = state.enemies.splice(i, 1);
        state.deadEnemies.push(dead[0]);
      } else {
        console.log("lost");
        state.player.dead = true;
      }
    }
  }
}

function handleBulletsTouchingEnemies() {
  state.bullets.forEach((bullet) => {
    for (let i = state.enemies.length - 1; i >= 0; i--) {
      const enemy = state.enemies[i];
      if (enemy.timeToSpawn >= 0) continue;
      const dx = enemy.x - bullet.x;
      const dy = enemy.y - bullet.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < enemy.radius) {
        if (enemy.number !== 13) {
          state.player.dead = true;
        } else {
          bullet.dead = true;
          const dead = state.enemies.splice(i, 1);
          state.deadEnemies.push(dead[0]);
        }
      }
    }
  });
}

function drawDeadEnemies(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "gray";
  state.deadEnemies.forEach((enemy) => {
    ctx.fillStyle = colors[enemy.number];
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawEnemyShadows(ctx: CanvasRenderingContext2D) {
  state.enemies
    .filter((enemy) => enemy.timeToSpawn <= 0)
    .forEach((enemy) => {
      ctx.fillStyle = colors[0];
      ctx.beginPath();
      ctx.arc(
        enemy.x + shadowOffset,
        enemy.y + shadowOffset,
        enemy.radius,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.fillStyle = colors[0];
    });
}

function drawPlayerShadow(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = colors[0];
  ctx.beginPath();
  ctx.arc(
    state.player.x + shadowOffset,
    state.player.y + shadowOffset,
    state.player.radius,
    0,
    Math.PI * 2,
  );
  ctx.fill();
}

function constrainBulletAmount() {
  const maxBullets = 20;
  let bulletsSeen = 0;
  for (let i = state.bullets.length - 1; i >= 0; i--) {
    if (state.bullets[i].dead) state.bullets.splice(i, 1);
    else {
      if (bulletsSeen++ > maxBullets) {
        state.bullets.splice(i, 1);
      }
    }
  }
  state.bullets = state.bullets.splice(
    Math.max(0, state.bullets.length - maxBullets),
  );
}

function drawGameOverScreen(ctx: CanvasRenderingContext2D) {
  ctx.globalAlpha = 0.5;
  // TODO: think more about this
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, gameArea.width, gameArea.height);
  ctx.globalAlpha = 1;

  // YOU DIED
  ctx.fillStyle = colors[2];
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font =
    "12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
  ctx.fillText("YOU LOSE", gameArea.width / 2, gameArea.height / 2);
}

function drawPlayer(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = colors[2];
  ctx.beginPath();
  ctx.roundRect(
    state.player.x - state.player.radius,
    state.player.y - state.player.radius,
    state.player.radius * 2,
    state.player.radius * 2,
    state.player.radius,
  );
  ctx.fill();
}

function drawEnemies(ctx: CanvasRenderingContext2D) {
  state.enemies
    .filter((enemy) => enemy.timeToSpawn >= 0)
    .forEach((enemy) => {
      drawEnemy(ctx, enemy);
    });
  state.enemies
    .filter((enemy) => enemy.timeToSpawn < 0)
    .forEach((enemy) => {
      drawEnemy(ctx, enemy);
    });
}

function drawLetterBoxing(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  drawingRect: {
    width: number;
    height: number;
  },
  xScale: number,
  yScale: number,
) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.translate(
    (drawingRect.width - gameArea.width * xScale) / 2,
    (drawingRect.height - gameArea.height * yScale) / 2,
  );
  ctx.scale(xScale, yScale);
  ctx.beginPath();
  ctx.rect(0, 0, gameArea.width, gameArea.height);
  ctx.clip();
  ctx.fillStyle = colors[3];
  ctx.fillRect(0, 0, gameArea.width, gameArea.height);
}

function updateEnemies(dt: number) {
  state.enemies.forEach((enemy) => {
    updateEnemy(enemy, dt);
    if (enemy.timeToSpawn > 0) return;

    // collide with other enemies
    state.enemies.forEach((otherEnemy) => {
      if (enemy === otherEnemy || otherEnemy.timeToSpawn > 0) return;
      const dist = Math.sqrt(
        (enemy.x - otherEnemy.x) ** 2 + (enemy.y - otherEnemy.y) ** 2,
      );
      if (dist < enemy.radius + otherEnemy.radius) {
        const angle = Math.atan2(
          otherEnemy.y - enemy.y,
          otherEnemy.x - enemy.x,
        );
        enemy.x -= Math.cos(angle) * (enemy.radius + otherEnemy.radius - dist);
        enemy.y -= Math.sin(angle) * (enemy.radius + otherEnemy.radius - dist);
      }
    });
  });
}

function handleSpawningEnemies(dt: number) {
  state.spawnTimer += dt;
  while (state.spawnTimer >= enemySpawnRate) {
    state.enemies.push(createEnemy());
    state.spawnTimer -= enemySpawnRate;
  }
}

function handlePlayerMovement(dt: number) {
  if (leftKeys.some((key) => keysDown.has(key))) {
    state.player.x -= (dt / 1000) * speed;
  }
  if (rightKeys.some((key) => keysDown.has(key))) {
    state.player.x += (dt / 1000) * speed;
  }
  if (upKeys.some((key) => keysDown.has(key))) {
    state.player.y -= (dt / 1000) * speed;
  }
  if (downKeys.some((key) => keysDown.has(key))) {
    state.player.y += (dt / 1000) * speed;
  }
  state.player.x = Math.max(
    playerRadius,
    Math.min(gameArea.width - playerRadius, state.player.x),
  );
  state.player.y = Math.max(
    playerRadius,
    Math.min(gameArea.height - playerRadius, state.player.y),
  );
}

function handleShoot() {
  const angle = Math.atan2(
    cursor.y - state.player.y,
    cursor.x - state.player.x,
  );
  state.bullets.push({
    x: state.player.x,
    y: state.player.y,
    dx: Math.cos(angle),
    dy: Math.sin(angle),
    r: 1,
    dead: false,
  });
}
