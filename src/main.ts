import { update, draw } from "./game";

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
  draw(ctx, canvas);

  requestAnimationFrame(animationFrame);
})();
