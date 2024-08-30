import {
  drawBullet,
  updateBullet,
  Bullet,
  drawBulletShadow,
  createBullet,
} from "./bullet";
import { fontStack, gameArea, colors, shadowOffset } from "./constants";
import {
  createEnemy,
  createNumberEnemy,
  drawEnemy,
  updateEnemy,
} from "./enemy";
import { keysDown, cursor } from "./input";
import { playDingSound, playHitSound, playShootSound } from "./sound";
import {
  DeadEnemy,
  createDeadEnemy,
  updateDeadEnemy,
  drawDeadEnemy,
} from "./dead-enemy";
import {
  createTransitionState,
  drawTransitionIn,
  updateTransition,
} from "./transition";

// CONSTANTS
const playerRadius = 2;
const enemySpawnRate = 1500;
const leftKeys = ["ArrowLeft", "a"];
const rightKeys = ["ArrowRight", "d"];
const upKeys = ["ArrowUp", "w"];
const downKeys = ["ArrowDown", "s"];

let state = {
  player: {
    x: gameArea.width / 2,
    y: 2 * (gameArea.height / 3),
    radius: playerRadius,
    dead: false,
    angle: 0,
  },
  bullets: [] as Bullet[],
  enemies: [] as ReturnType<typeof createEnemy>[],
  deadEnemies: [] as DeadEnemy[],
  spawnTimer: 0,

  step: "move" as "move" | "touch" | "shoot",
  stepProgress: 0,
  timeAtStep: 0,
  distanceMoved: 0,

  fadeIn: createTransitionState(),
};

const transitionDuration = 1000;

export function update(dt: number) {
  updateTransition(state.fadeIn, dt);

  const prevPlayerPos = {
    x: state.player.x,
    y: state.player.y,
  };

  // main game stuff?
  {
    if (state.player.dead) return;
    handlePlayerMovement(dt);
    // handleSpawningEnemies(dt);
    if (cursor.clicked) handleShoot();
    updateEnemies(dt);
    state.bullets.forEach((bullet) => updateBullet(bullet, dt));
    constrainBulletAmount();
    handleBulletsTouchingEnemies();
    handlePlayerTouchingEnemies();
    state.deadEnemies.forEach((deadEnemy) => updateDeadEnemy(deadEnemy, dt));
    state.deadEnemies = state.deadEnemies.filter(
      (deadEnemy) => deadEnemy.life > 0,
    );
  }

  state.distanceMoved += Math.hypot(
    state.player.x - prevPlayerPos.x,
    state.player.y - prevPlayerPos.y,
  );

  if (state.step === "move") {
    const toProceed = 50;
    state.stepProgress = Math.min(state.distanceMoved / toProceed, 1);
    if (state.stepProgress >= 1) {
      state.stepProgress = 0;
      state.step = "touch";
      // spawn some non 13s
      const enemies = [
        { x: 25, y: 90, num: 11 },
        { x: 25, y: 60, num: 12 },
        { x: 75, y: 90, num: 14 },
        { x: 75, y: 60, num: 15 },
      ];
      for (const enemy of enemies) {
        state.enemies.push(
          createNumberEnemy(enemy.x, enemy.y, 0, 0, enemy.num),
        );
      }
      playDingSound();
    }
  } else if (state.step === "touch") {
    const enemiesToKill = 4;
    const enemiesAlive = state.enemies.length;
    state.stepProgress = 1 - enemiesAlive / enemiesToKill;
    if (enemiesAlive === 0) {
      state.stepProgress = 0;
      state.step = "shoot";
      // spawn some 13s
      const enemies = [
        { x: 25, y: 90, num: 13 },
        { x: 25, y: 60, num: 13 },
        { x: 75, y: 90, num: 13 },
        { x: 75, y: 60, num: 13 },
      ];
      for (const enemy of enemies) {
        state.enemies.push(
          createNumberEnemy(enemy.x, enemy.y, 0, 0, enemy.num),
        );
      }
      playDingSound();
    }
  } else if (state.step === "shoot") {
    const enemiesToKill = 4;
    const enemiesAlive = state.enemies.length;
    state.stepProgress = 1 - enemiesAlive / enemiesToKill;
    if (enemiesAlive === 0) {
      state.stepProgress = 0;
      // state.step = "booth";
      // spawn some 13s
      const enemies = [
        { x: 25, y: 90, num: 13 },
        { x: 25, y: 60, num: 13 },
        { x: 75, y: 90, num: 13 },
        { x: 75, y: 60, num: 13 },
      ];
      for (const enemy of enemies) {
        state.enemies.push(
          createNumberEnemy(enemy.x, enemy.y, 0, 0, enemy.num),
        );
      }
      playDingSound();
    }
  }
}

export function draw(ctx: CanvasRenderingContext2D) {
  drawTransitionIn(ctx, state.fadeIn);
  ctx.fillStyle = colors[3];
  ctx.fillRect(0, 0, gameArea.width, gameArea.height);
  {
    state.deadEnemies.forEach((deadEnemy) => drawDeadEnemy(ctx, deadEnemy));
    drawPlayerShadow(ctx);
    drawEnemyShadows(ctx);
    state.bullets.forEach((bullet) => drawBulletShadow(ctx, bullet));
    drawEnemies(ctx);
    state.bullets.forEach((bullet) => drawBullet(ctx, bullet));
    drawPlayer(ctx);
    if (state.player.dead) drawGameOverScreen(ctx);
  }

  drawHelpText(ctx);
  ctx.fillStyle = colors[1];
  ctx.fillRect(0, 0, 100 * state.stepProgress, 4);
}

const stepTexts = {
  move: "WASD or arrow keys to move",
  touch: "touch non-13 numbers",
  shoot: "shoot 13s by clicking",
};

function drawHelpText(ctx: CanvasRenderingContext2D) {
  ctx.font = `6px ${fontStack}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = colors[1];
  ctx.fillText(stepTexts[state.step], gameArea.width / 2, gameArea.height / 8);
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
        // state.deadEnemies.push(enemy);
        const dead = state.enemies.splice(i, 1);
        state.deadEnemies.push(
          createDeadEnemy(
            dead[0].x,
            dead[0].y,
            dead[0].dx,
            dead[0].radius,
            dead[0].text,
          ),
        );
      } else {
        console.log("lost");
        state.player.dead = true;
      }
      playHitSound();
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
          state.deadEnemies.push(
            createDeadEnemy(
              dead[0].x,
              dead[0].y,
              dead[0].dx,
              dead[0].radius,
              dead[0].text,
            ),
          );
        }
        playHitSound();
        break;
      }
    }
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
  ctx.translate(shadowOffset, shadowOffset);
  drawPlayerShape(ctx);
  ctx.translate(-shadowOffset, -shadowOffset);
}

function drawPlayerShape(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.beginPath();
  // rotate center
  ctx.translate(state.player.x, state.player.y);
  ctx.rotate(state.player.angle);
  ctx.translate(-state.player.x, -state.player.y);
  ctx.fillRect(
    state.player.x - state.player.radius,
    state.player.y - state.player.radius,
    state.player.radius * 2,
    state.player.radius * 2,
  );
  ctx.fill();
  ctx.restore();
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
  ctx.font = `12px ${fontStack}`;
  ctx.fillText("YOU LOSE", gameArea.width / 2, gameArea.height / 2);
}

function drawPlayer(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = colors[2];
  drawPlayerShape(ctx);
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
  const playerSpeed = 30;
  const prevx = state.player.x;
  const prevy = state.player.y;
  if (leftKeys.some((key) => keysDown.has(key))) {
    state.player.x -= (dt / 1000) * playerSpeed;
  }
  if (rightKeys.some((key) => keysDown.has(key))) {
    state.player.x += (dt / 1000) * playerSpeed;
  }
  if (upKeys.some((key) => keysDown.has(key))) {
    state.player.y -= (dt / 1000) * playerSpeed;
  }
  if (downKeys.some((key) => keysDown.has(key))) {
    state.player.y += (dt / 1000) * playerSpeed;
  }
  state.player.x = Math.max(
    playerRadius,
    Math.min(gameArea.width - playerRadius, state.player.x),
  );
  state.player.y = Math.max(
    playerRadius,
    Math.min(gameArea.height - playerRadius, state.player.y),
  );

  // fun rotating movement animation
  const strength = 0.2;
  const rotSpeed = 0.02;
  const moving = prevx !== state.player.x || prevy !== state.player.y;
  state.player.angle = moving
    ? (state.player.angle =
        (Math.sin(performance.now() * rotSpeed) - 0.5) * strength)
    : 0;
}

function handleShoot() {
  playShootSound();
  const angle = Math.atan2(
    cursor.y - state.player.y,
    cursor.x - state.player.x,
  );
  state.bullets.push(createBullet(state.player.x, state.player.y, angle));

  const recoil = 0.5;
  // do recoil
  state.player.x -= Math.cos(angle) * recoil;
  state.player.y -= Math.sin(angle) * recoil;
}
