import { createBullets, drawBullets, drawBulletsShadows } from "./bullets";
import {
  fontStack,
  gameArea,
  colors,
  shadowOffset,
  playerRadius,
} from "./constants";
import { createEnemy, createNumberEnemy, drawEnemy } from "./enemy";
import { playDingSound, playLetterSound } from "./sound";
import { DeadEnemy, drawDeadEnemy } from "./dead-enemy";
import {
  createTransitionState,
  drawTransitionIn,
  drawTransitionOut,
  isTransitionDone,
  updateTransition,
} from "./transition";
import { changeScene } from "./game";
import * as Levels from "./levels";
import * as Base from "./base-game";

const stepLogic: {
  start: (state: ReturnType<typeof createState>) => void;
  update: (state: ReturnType<typeof createState>, dt: number) => void;
}[] = [
  {
    start(state) {
      prepareHelpText(state, "WASD or arrow keys to move");
    },
    update(state, dt) {
      const toProceed = 50;
      state.stepProgress = Math.min(state.distanceMoved / toProceed, 1);
      if (state.stepProgress >= 1) {
        state.stepProgress = 0;
        incStep(state);
        playDingSound();
        state.timeAtStep = -500;
      }
    },
  },
  {
    start(state) {
      prepareHelpText(state, "touch non-13 numbers");
    },
    update(state, dt) {
      const enemiesToKill = 4;
      state.stepProgress = 0;
      const finishedHelpText =
        state.charactersToShow === state.textToShow.length;
      if (!state.enemiesSpawned && finishedHelpText) {
        state.enemiesSpawned = true;
        // spawn some non 13s
        const enemies = [
          { x: 25, y: 90, num: 11 },
          { x: 25, y: 60, num: 12 },
          { x: 75, y: 90, num: 14 },
          { x: 75, y: 60, num: 15 },
        ];
        for (const enemy of enemies) {
          state.base.enemies.push(
            createNumberEnemy(enemy.x, enemy.y, 0, 0, enemy.num),
          );
        }
      }
      if (state.enemiesSpawned) {
        const enemiesAlive = state.base.enemies.length;
        state.stepProgress = 1 - enemiesAlive / enemiesToKill;
        if (enemiesAlive === 0) {
          playDingSound();
          state.timeAtStep = -500;
          incStep(state);
        }
      }
    },
  },
  {
    start(state) {
      prepareHelpText(state, "shoot 13s by clicking");
      state.enemiesSpawned = false;
    },
    update(state, dt) {
      state.stepProgress = 0;
      const finishedHelpText =
        state.charactersToShow === state.textToShow.length;
      if (!state.enemiesSpawned && finishedHelpText) {
        state.enemiesSpawned = true;
        const enemies = [
          { x: 25, y: 90, num: 13 },
          { x: 25, y: 60, num: 13 },
          { x: 75, y: 90, num: 13 },
          { x: 75, y: 60, num: 13 },
        ];
        for (const enemy of enemies) {
          state.base.enemies.push(
            createNumberEnemy(enemy.x, enemy.y, 0, 0, enemy.num),
          );
        }
      }
      if (state.enemiesSpawned) {
        const enemiesToKill = 4;
        const enemiesAlive = state.base.enemies.length;
        state.stepProgress = 1 - enemiesAlive / enemiesToKill;
        if (enemiesAlive === 0 && state.finishedTutorial === false) {
          // state.stepProgress = 0;
          playDingSound();
          // incStep(state);
          state.finishedTutorial = true;
        }
      }
    },
  },
];

type State = ReturnType<typeof createState>;
export function createState() {
  let state = {
    // base game state
    base: {
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
    },

    // bar progress
    stepProgress: 0,
    stepVisualProgress: 0,

    // tutorial state
    step: 0,
    distanceMoved: 0,
    finishedTutorial: false,
    finishedTime: 0,

    // tutorial text
    timeAtStep: -500,
    charactersToShow: 0,
    textToShow: "",

    // for enemy spawned tuts
    enemiesSpawned: false,

    // fade in animation state?
    fadeIn: createTransitionState(),
    fadeOut: createTransitionState(),
  };
  stepLogic[state.step].start(state);
  return state;
}

function incStep(state: State) {
  state.step++;
  stepLogic[state.step].start(state);
}

function prepareHelpText(state: State, text: string) {
  state.timeAtStep = -500;
  state.charactersToShow = 0;
  state.textToShow = text;
}

export function update(state: State, dt: number) {
  updateTransition(state.fadeIn, dt);
  updateHelpText(state, dt);
  const prevPlayerPos = { x: state.base.player.x, y: state.base.player.y };
  Base.update(state.base, dt);
  {
    // needed for tutorial 1.. don't love this
    state.distanceMoved += Math.hypot(
      state.base.player.x - prevPlayerPos.x,
      state.base.player.y - prevPlayerPos.y,
    );
  }
  stepLogic[state.step].update(state, dt);
  animateProgress(state, dt);

  if (state.finishedTutorial) {
    state.finishedTime += dt;
    if (state.finishedTime > 1000) {
      updateTransition(state.fadeOut, dt);
    }
    if (isTransitionDone(state.fadeOut)) {
      changeScene(Levels);
    }
  }
}

export function draw(state: State, ctx: CanvasRenderingContext2D) {
  drawTransitionIn(ctx, state.fadeIn);
  if (state.finishedTutorial) {
    drawTransitionOut(ctx, state.fadeOut);
  }
  ctx.fillStyle = colors[3];
  ctx.fillRect(0, 0, gameArea.width, gameArea.height);
  {
    state.base.deadEnemies.forEach((deadEnemy) =>
      drawDeadEnemy(ctx, deadEnemy),
    );
    drawPlayerShadow(state, ctx);
    drawEnemyShadows(state, ctx);
    drawBulletsShadows(state.base.bullets, ctx);
    drawEnemies(state, ctx);
    drawBullets(state.base.bullets, ctx);
    drawPlayer(state, ctx);
    if (state.base.player.dead) drawGameOverScreen(state, ctx);
  }

  drawHelpText(state, ctx);
  ctx.fillStyle = colors[1];
  ctx.fillRect(0, 0, 100 * state.stepVisualProgress, 4);
}

function animateProgress(state: State, dt: number) {
  const diff = state.stepProgress - state.stepVisualProgress;
  const speed = 0.01;
  state.stepVisualProgress += diff * speed * dt;
}

function updateHelpText(state: State, dt: number) {
  const prevCharactersToShow = state.charactersToShow;
  state.timeAtStep += dt;
  const msPerCharacter = 50;
  const charactersToShow = Math.min(
    state.textToShow.length,
    Math.floor(Math.max(state.timeAtStep, 0) / msPerCharacter),
  );
  state.charactersToShow = charactersToShow;
  if (charactersToShow > prevCharactersToShow) {
    playLetterSound();
  }
}
function drawHelpText(state: State, ctx: CanvasRenderingContext2D) {
  ctx.font = `6px ${fontStack}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = colors[1];

  ctx.fillText(
    state.textToShow.slice(0, state.charactersToShow),
    gameArea.width / 2,
    gameArea.height / 8,
  );
}

function drawEnemyShadows(state: State, ctx: CanvasRenderingContext2D) {
  state.base.enemies
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
  ctx.translate(state.base.player.x, state.base.player.y);
  ctx.rotate(state.base.player.angle);
  ctx.translate(-state.base.player.x, -state.base.player.y);
  ctx.fillRect(
    state.base.player.x - state.base.player.radius,
    state.base.player.y - state.base.player.radius,
    state.base.player.radius * 2,
    state.base.player.radius * 2,
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
    state.base.player.deathReason,
    gameArea.width / 2,
    gameArea.height / 2,
  );
}

function drawPlayer(state: State, ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = colors[2];
  drawPlayerShape(state, ctx);
}

function drawEnemies(state: State, ctx: CanvasRenderingContext2D) {
  state.base.enemies
    .filter((enemy) => enemy.timeToSpawn >= 0)
    .forEach((enemy) => {
      drawEnemy(ctx, enemy);
    });
  state.base.enemies
    .filter((enemy) => enemy.timeToSpawn < 0)
    .forEach((enemy) => {
      drawEnemy(ctx, enemy);
    });
}
