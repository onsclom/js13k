import { colors, gameArea, fontStack } from "./constants";
import { cursor } from "./input";
import { changeScene } from "./game";
import * as Tutorial from "./tutorial";
import { shadowOffset } from "./constants";
import {
  createTransitionState,
  drawTransitionOut,
  isTransitionDone,
  updateTransition,
} from "./transition";

export function createState() {
  return {
    fadingOut: false,
    transition: createTransitionState(),
  };
}

export function update(state: ReturnType<typeof createState>, dt: number) {
  if (cursor.clicked && !state.fadingOut) {
    state.fadingOut = true;
  }

  if (state.fadingOut) {
    updateTransition(state.transition, dt);
  }

  if (isTransitionDone(state.transition)) {
    changeScene(Tutorial);
  }
}

export function draw(
  state: ReturnType<typeof createState>,
  ctx: CanvasRenderingContext2D,
) {
  if (state.fadingOut) {
    drawTransitionOut(ctx, state.transition);
  }

  ctx.fillStyle = colors[3];
  ctx.fillRect(0, 0, gameArea.width, gameArea.height);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `12px ${fontStack}`;

  const scale = (Math.sin(performance.now() * 0.002) + 10) * 0.1;
  ctx.save();
  {
    ctx.save();
    ctx.translate(0, -10);
    ctx.translate(gameArea.width / 2, gameArea.height / 2);
    ctx.translate(shadowOffset, shadowOffset);
    ctx.rotate((Math.sin(performance.now() * 0.003) - 0.5) * 0.1);
    ctx.scale(scale, scale);
    ctx.translate(-gameArea.width / 2, -gameArea.height / 2);
    ctx.fillStyle = colors[0];
    ctx.fillText("Quick Maths", gameArea.width / 2, gameArea.height / 2);
    ctx.restore();
  }
  {
    ctx.save();
    ctx.translate(0, -10);
    ctx.translate(gameArea.width / 2, gameArea.height / 2);
    ctx.rotate((Math.sin(performance.now() * 0.003) - 0.5) * 0.1);
    ctx.scale(scale, scale);
    ctx.translate(-gameArea.width / 2, -gameArea.height / 2);
    ctx.fillStyle = colors[1];
    ctx.fillText("Quick Maths", gameArea.width / 2, gameArea.height / 2);
    ctx.restore();
  }
  ctx.restore();

  ctx.font = `8px ${fontStack}`;
  ctx.save();
  ctx.translate(0, 10);
  ctx.translate(gameArea.width / 2, gameArea.height / 2);
  ctx.translate(-gameArea.width / 2, -gameArea.height / 2);
  ctx.translate(shadowOffset, shadowOffset);
  ctx.fillStyle = colors[0];
  ctx.fillText("click to start", gameArea.width / 2, gameArea.height / 2);
  ctx.translate(-shadowOffset, -shadowOffset);
  ctx.fillStyle = colors[2];
  ctx.fillText("click to start", gameArea.width / 2, gameArea.height / 2);
  ctx.restore();
}
