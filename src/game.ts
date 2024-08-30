import * as Title from "./title.ts";

type Scene = {
  update: (dt: number) => void;
  draw: (ctx: CanvasRenderingContext2D) => void;
};

let curScene: Scene = Title;
// changing scene would happen next frame.. a bit unfortunate, but okay maybe?
export function changeScene(newScene: Scene) {
  curScene = newScene;
}

export function update(dt: number) {
  curScene.update(dt);
}

export function draw(ctx: CanvasRenderingContext2D) {
  curScene.draw(ctx);
}
