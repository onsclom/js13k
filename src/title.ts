import { colors, gameArea, fontStack } from "./constants";
import { changeScene } from "./game";
import { cursor, keysDown } from "./input";
import * as Tutorial from "./tutorial";
import { shadowOffset } from "./constants";

export function update(dt: number) {
  if (cursor.clicked) {
    changeScene(Tutorial);
  }
}

export function draw(ctx: CanvasRenderingContext2D) {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `12px ${fontStack}`;

  ctx.save();
  {
    ctx.save();
    ctx.translate(0, -10);
    ctx.translate(gameArea.width / 2, gameArea.height / 2);
    ctx.translate(shadowOffset, shadowOffset);
    ctx.rotate((Math.sin(performance.now() * 0.003) - 0.5) * 0.1);
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
