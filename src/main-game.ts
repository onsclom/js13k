import {
  createTransitionState,
  drawTransitionIn,
  updateTransition,
} from "./transition";
import { colors, fontStack, gameArea } from "./constants";
import * as Base from "./base-game";
import { createEnemy } from "./enemy";

const enemySpawnRate = 2000;

export function createState() {
  return {
    fadeIn: createTransitionState(),
    base: Base.createState(),
    enemySpawnTimer: 0,
  };
}

type State = ReturnType<typeof createState>;

export function update(state: State, dt: number) {
  state.enemySpawnTimer += dt;
  while (state.enemySpawnTimer >= enemySpawnRate) {
    state.enemySpawnTimer -= enemySpawnRate;
    state.base.enemies.push(createEnemy());
  }
  updateTransition(state.fadeIn, dt);
  Base.update(state.base, dt);
}

export function draw(state: State, ctx: CanvasRenderingContext2D) {
  drawTransitionIn(ctx, state.fadeIn);
  ctx.fillStyle = colors[3];
  ctx.fillRect(0, 0, gameArea.width, gameArea.height);
  Base.draw(state.base, ctx);

  {
    const fontSize = 6;
    ctx.fillStyle = colors[0];
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${fontSize}px ${fontStack}`;
    ctx.fillText(`${state.base.killed}`, gameArea.width / 2, fontSize);
  }
}
