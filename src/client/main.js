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

export function resetGameState() {
  app.scene = SCENE_MENU;
}

/**
 * https://webglfundamentals.org/webgl/lessons/webgl-tips.html
 */
export const downloadBlob = (() => {
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.style.display = "none";

  return (blob, fileName) => {
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    a.remove(); //Remove the element then took screenshot.
  };
})();

export default app;
