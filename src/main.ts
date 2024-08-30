import { update, draw } from "./game";
import { resetClicked } from "./input";
import { gameAreaInScreenSpace } from "./utils";
import { gameArea, colors } from "./constants";

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

let lastTime = performance.now();
(function animationFrame() {
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  const dpi = window.devicePixelRatio;
  canvas.width = window.innerWidth * dpi;
  canvas.height = window.innerHeight * dpi;
  ctx.scale(dpi, dpi);
  ctx.font =
    "3px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

  {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    update(deltaTime);
  }
  const drawingRect = canvas.getBoundingClientRect();
  const { xScale, yScale } = gameAreaInScreenSpace(canvas);
  drawLetterBoxing(ctx, canvas, drawingRect, xScale, yScale);
  draw(ctx, canvas);
  requestAnimationFrame(animationFrame);
  resetClicked();
})();

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
