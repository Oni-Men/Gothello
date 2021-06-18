import App from "./App.svelte";
import { SCENE_MENU, SCENE_PLAYING } from "./define";
import * as Net from "./netHandle";

const app = new App({
  target: document.body,
  props: {
    game: null,
    scene: SCENE_PLAYING,
    token: "",
  },
});

// const ws = new WebSocket(`ws://${window.location.host}/game`);
const ws = new WebSocket(`ws://localhost/game`);
ws.onmessage = function (e) {
  const data = JSON.parse(e.data);
  const handler = Net.Handlers[data.type];
  if (handler) {
    //handler(data);
  } else {
    console.log(`Handler for ${data.type} not found`);
  }
};

export function sendJson(data) {
  try {
    //ws.send(JSON.stringify(data));
  } catch (error) {
    resetGameState();
  }
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
    a.remove();
  };
})();

export default app;
