import { gameArea } from "./constants";

export function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function randomChoice<T>(choices: T[]): T {
  return choices[Math.floor(Math.random() * choices.length)];
}

export function gameAreaInScreenSpace(canvas: HTMLCanvasElement) {
  const drawingRect = canvas.getBoundingClientRect();
  const aspectRatio = gameArea.width / gameArea.height;
  const windowAspectRatio = drawingRect.width / drawingRect.height;
  const xScale =
    windowAspectRatio > aspectRatio
      ? drawingRect.height / gameArea.height
      : drawingRect.width / gameArea.width;
  const yScale =
    windowAspectRatio > aspectRatio
      ? drawingRect.height / gameArea.height
      : drawingRect.width / gameArea.width;
  return {
    x: (drawingRect.width - gameArea.width * xScale) / 2,
    y: (drawingRect.height - gameArea.height * yScale) / 2,
    width: gameArea.width * xScale,
    height: gameArea.height * yScale,
    xScale,
    yScale,
  };
}
