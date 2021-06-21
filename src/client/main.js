import App from "./App.svelte";
import { SCENE_MENU } from "./define";
import * as Net from "./netHandle";

const app = new App({
  target: document.body,
  props: {
    game: null,
    result: null,
    scene: SCENE_MENU,
    turn: false,
    token: "",
  },
});

// const ws = new WebSocket(`ws://${window.location.host}/game`);
let ws = new WebSocket(`ws://localhost/game`);
ws.onmessage = function (e) {
  const data = JSON.parse(e.data);
  console.log(data);
  const handler = Net.Handlers[data.type];
  if (handler) {
    handler(data);
  } else {
    console.log(`Handler for ${data.type} not found`);
  }
};

ws.onclose = function (e) {
  resetGameState();
};

export function sendJson(data) {
  data.token = app.token;
  setTimeout(() => {
    ws.send(JSON.stringify(data));
  }, 10);
}

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
    a.remove();
  };
})();

export default app;
