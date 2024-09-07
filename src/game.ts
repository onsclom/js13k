import * as Title from "./title.ts";
import * as MainGame from "./main-game.ts";

type Scene<State> = {
  createState: () => State;
  update: (state: State, dt: number) => void;
  draw: (state: State, ctx: CanvasRenderingContext2D) => void;
};

// let curScene: Scene<any> = Title;
let curScene: Scene<any> = MainGame;
let curState: any = curScene.createState();

// Change scene function to reset state
export function changeScene<State>(newScene: Scene<State>) {
  curScene = newScene;
  curState = curScene.createState();
}

export function update(dt: number) {
  curScene.update(curState, dt);
}

export function draw(ctx: CanvasRenderingContext2D) {
  curScene.draw(curState, ctx);
}

export function reloadScene() {
  curState = curScene.createState();
}
