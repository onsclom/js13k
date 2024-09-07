import { Bullets, createBullet, createBullets, updateBullets } from "./bullets";
import {
  colors,
  fontStack,
  gameArea,
  playerRadius,
  shadowOffset,
} from "./constants";
import {
  createDeadEnemy,
  DeadEnemy,
  drawDeadEnemy,
  updateDeadEnemy,
} from "./dead-enemy";
import { createEnemy, drawEnemy, updateEnemy } from "./enemy";
import { reloadScene } from "./game";
import { cursor, keysDown } from "./input";
import { playHitSound, playShootSound } from "./sound";

type State = ReturnType<typeof createState>;
export function createState() {
  return {
    // base game state
    player: {
      x: gameArea.width / 2,
      y: 2 * (gameArea.height / 3),
      radius: playerRadius,
      dead: false,
      deathReason: "",
      timeDead: 0,
      angle: 0,
    },
    bullets: createBullets(),
    enemies: [] as ReturnType<typeof createEnemy>[],
    deadEnemies: [] as DeadEnemy[],
    killed: 0,
  };
}

export function update(state: State, dt: number) {
  if (state.player.dead) {
    state.player.timeDead += dt;
    if (state.player.timeDead > 1000) {
      reloadScene();
    }
  }
  if (state.player.dead) return;
  handlePlayerMovement(state, dt);
  if (cursor.clicked) handleShoot(state);
  updateEnemies(state, dt);
  updateBullets(state.bullets, dt);
  constrainBulletAmount(state);
  handleBulletsTouchingEnemies(state);
  handlePlayerTouchingEnemies(state);
  state.deadEnemies.forEach((deadEnemy) => updateDeadEnemy(deadEnemy, dt));
  state.deadEnemies = state.deadEnemies.filter(
    (deadEnemy) => deadEnemy.life > 0,
  );
}

export function draw(state: State, ctx: CanvasRenderingContext2D) {
  {
    state.deadEnemies.forEach((deadEnemy) => drawDeadEnemy(ctx, deadEnemy));
    drawPlayerShadow(state, ctx);
    drawEnemyShadows(state, ctx);
    drawBulletsShadows(state.bullets, ctx);
    drawEnemies(state, ctx);
    drawBullets(state.bullets, ctx);
    drawPlayer(state, ctx);
    if (state.player.dead) drawGameOverScreen(state, ctx);
  }
}

function drawBulletShape(ctx: CanvasRenderingContext2D, bullet: Bullet) {
  ctx.beginPath();
  ctx.arc(bullet.x, bullet.y, bullet.r, 0, Math.PI * 2);
  ctx.fill();
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (const particle of particles) {
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawBullets(bullets: Bullets, ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#ddf";
  drawParticles(ctx, bullets.particles);
  ctx.fillStyle = "#88a";
  for (const bullet of bullets.projectiles) drawBulletShape(ctx, bullet);
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

function drawEnemyShadows(state: State, ctx: CanvasRenderingContext2D) {
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

function drawPlayerShadow(state: State, ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = colors[0];
  ctx.translate(shadowOffset, shadowOffset);
  drawPlayerShape(state, ctx);
  ctx.translate(-shadowOffset, -shadowOffset);
}

function drawPlayerShape(state: State, ctx: CanvasRenderingContext2D) {
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

function drawGameOverScreen(state: State, ctx: CanvasRenderingContext2D) {
  ctx.globalAlpha = 0.7;
  // TODO: think more about this
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, gameArea.width, gameArea.height);
  ctx.globalAlpha = 1;

  // YOU DIED
  ctx.fillStyle = colors[1];
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `12px ${fontStack}`;
  ctx.fillText(
    state.player.deathReason,
    gameArea.width / 2,
    gameArea.height / 2,
  );
}

function drawPlayer(state: State, ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = colors[2];
  drawPlayerShape(state, ctx);
}

function drawEnemies(state: State, ctx: CanvasRenderingContext2D) {
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

function handlePlayerTouchingEnemies(state: State) {
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
          createDeadEnemy(dead[0].x, dead[0].y, dead[0].radius, dead[0].text),
        );
        state.killed++;
      } else {
        killPlayer(state, `you shot ${enemy.text}!`);
        state.player.deathReason = `you touched ${enemy.text}!`;
      }
      playHitSound();
    }
  }
}

// TODO: fix this
function constrainBulletAmount(state: State) {
  const maxBullets = 20;
  let bulletsSeen = 0;
  for (let i = state.bullets.projectiles.length - 1; i >= 0; i--) {
    if (state.bullets.projectiles[i].dead)
      state.bullets.projectiles.splice(i, 1);
    {
      if (bulletsSeen++ > maxBullets) {
        state.bullets.projectiles.splice(i, 1);
      }
    }
  }
  state.bullets.projectiles = state.bullets.projectiles.splice(
    Math.max(0, state.bullets.projectiles.length - maxBullets),
  );
}

function updateEnemies(state: State, dt: number) {
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

function handleShoot(state: State) {
  playShootSound();
  const angle = Math.atan2(
    cursor.y - state.player.y,
    cursor.x - state.player.x,
  );
  createBullet(state.bullets, state.player.x, state.player.y, angle);
  const recoil = 0.5;
  state.player.x -= Math.cos(angle) * recoil;
  state.player.y -= Math.sin(angle) * recoil;
}

function handleBulletsTouchingEnemies(state: State) {
  state.bullets.projectiles.forEach((bullet) => {
    for (let i = state.enemies.length - 1; i >= 0; i--) {
      const enemy = state.enemies[i];
      if (enemy.timeToSpawn >= 0) continue;
      const dx = enemy.x - bullet.x;
      const dy = enemy.y - bullet.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < enemy.radius + bullet.r) {
        if (enemy.number !== 13) {
          killPlayer(state, `you shot ${enemy.text}!`);
          state.player.deathReason = `you shot ${enemy.text}!`;
        } else {
          bullet.dead = true;
          const dead = state.enemies.splice(i, 1);
          state.deadEnemies.push(
            createDeadEnemy(dead[0].x, dead[0].y, dead[0].radius, dead[0].text),
          );
          state.killed++;
        }
        playHitSound();
        break;
      }
    }
  });
}

function killPlayer(state: State, reason: string) {
  state.player.dead = true;
  state.player.deathReason = reason;
}
// CONSTANTS
const leftKeys = ["ArrowLeft", "a"];
const rightKeys = ["ArrowRight", "d"];
const upKeys = ["ArrowUp", "w"];
const downKeys = ["ArrowDown", "s"];
function handlePlayerMovement(state: State, dt: number) {
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
