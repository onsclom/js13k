import { gameAreaInScreenSpace } from "./utils";
import { gameArea } from "./constants";

export const keysDown = new Set<string>();
document.onkeydown = (e) => keysDown.add(e.key);
document.onkeyup = (e) => keysDown.delete(e.key);
document.onpointerdown = () => (cursor.clicked = true);

export const cursor = { x: 0, y: 0, clicked: false };

document.onmousemove = (e) => {
  const screenCoords = { x: e.clientX, y: e.clientY };
  const { x, y, width, height } = gameAreaInScreenSpace(
    document.querySelector("canvas") as HTMLCanvasElement,
  );
  cursor.x = ((screenCoords.x - x) / width) * gameArea.width;
  cursor.y = ((screenCoords.y - y) / height) * gameArea.height;
};

export function resetClicked() {
  cursor.clicked = false;
}
