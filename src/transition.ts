import { gameArea } from "./constants";

export const transitionDuration = 500;

export function createTransitionState() {
  return { transitionTime: 0 };
}

export function updateTransition(
  state: ReturnType<typeof createTransitionState>,
  dt: number,
) {
  state.transitionTime += dt;
  state.transitionTime = Math.min(state.transitionTime, transitionDuration);
}

const gameAreaHypot = Math.hypot(gameArea.width, gameArea.height);

export function drawTransitionOut(
  ctx: CanvasRenderingContext2D,
  state: ReturnType<typeof createTransitionState>,
) {
  const fadeOutProgress = state.transitionTime / transitionDuration;
  ctx.beginPath();
  ctx.ellipse(
    gameArea.width / 2,
    gameArea.height / 2,
    gameAreaHypot * (1 - fadeOutProgress) * 0.5,
    gameAreaHypot * (1 - fadeOutProgress) * 0.5,
    0,
    0,
    Math.PI * 2,
  );
  ctx.clip();
}

export function isTransitionDone(
  state: ReturnType<typeof createTransitionState>,
) {
  return state.transitionTime >= transitionDuration;
}

export function drawTransitionIn(
  ctx: CanvasRenderingContext2D,
  state: ReturnType<typeof createTransitionState>,
) {
  const fadeInProgress = state.transitionTime / transitionDuration;
  ctx.beginPath();
  ctx.ellipse(
    gameArea.width / 2,
    gameArea.height / 2,
    gameAreaHypot * 0.5 * fadeInProgress,
    gameAreaHypot * 0.5 * fadeInProgress,
    0,
    0,
    Math.PI * 2,
  );
  ctx.clip();
}
