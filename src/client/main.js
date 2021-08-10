import App from "./App.svelte";
import { SCENE_MENU } from "./define";

const app = new App({
  target: document.body,
  props: {
    game: null,
    result: null,
    scene: SCENE_MENU,
    turn: false,
    token: "",
    errorMessage: "",
  },
});

export default app;
