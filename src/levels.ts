import {
  createTransitionState,
  drawTransitionIn,
  updateTransition,
} from "./transition";
import { colors, gameArea } from "./constants";

export function createState() {
  return {
    fadeIn: createTransitionState(),
  };
}

type State = ReturnType<typeof createState>;

export function update(state: State, dt: number) {
  updateTransition(state.fadeIn, dt);
}

export function draw(state: State, ctx: CanvasRenderingContext2D) {
  drawTransitionIn(ctx, state.fadeIn);
  ctx.fillStyle = colors[3];
  ctx.fillRect(0, 0, gameArea.width, gameArea.height);
}
