import { createBullet, createBullets, updateBullets } from "./bullets";
import { gameArea, playerRadius } from "./constants";
import { createDeadEnemy, DeadEnemy, updateDeadEnemy } from "./dead-enemy";
import { createEnemy, updateEnemy } from "./enemy";
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
  };
}

export function update(state: State, dt: number) {
  // main game stuff?
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

export function draw(state: State, ctx: CanvasRenderingContext2D) {}

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
