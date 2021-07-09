import { SCENE_ENDING, SCENE_MATCHING, SCENE_MENU, SCENE_PLAYING } from "./define";
import app, { resetGameState } from "./main";
import { Game } from "./game/game";
import { orbit } from "./render/render";

export const FAIL = -1;
export const AUTHENTICATION = 0;
export const FIND_OPPONENT = 1;
export const GAME_INFO = 2;
export const TURN_UPDATE = 3;
export const BOARD_UPDATE = 4;
export const GAME_OVER = 5;
export const CLICK_BOARD = 6;
export const SPECTATE = 7;

export const Handlers = [
  handleAuthentication,
  handleFindOpponent,
  handleGameInfo,
  handleTurnUpdate,
  handleBoardUpdate,
  handleGameOver,
  handleClickBoard,
  handleSpectate,
];

let ws = new WebSocket(`ws://${window.location.host}/game`);
ws.addEventListener("open", requestAuthentication);
ws.addEventListener("close", resetGameState);
ws.addEventListener("message", (e) => {
  const data = JSON.parse(e.data);

  if (data.type < 0) {
    app.errorMessage = data.error;
    console.error(data.error);
  }

  const handler = Handlers[data.type];
  if (handler) {
    handler(data);
  } else {
    console.log(`Handler for ${data.type} not found`);
  }
});

let playerId = 0;
let playerInfo = null;

export function sendJson(data) {
  data.token = app.token;
  setTimeout(() => {
    ws.send(JSON.stringify(data));
  }, 10);
}

export function requestAuthentication() {
  let nickname = localStorage.getItem("nickname");

  while (!nickname || nickname.length < 3) {
    nickname = window.prompt("ニックネームを決めてください(3文字以上)");
  }
  localStorage.setItem("nickname", nickname);

  sendJson({
    type: AUTHENTICATION,
    nickname,
  });
}

export function startFindingOpponent() {
  app.scene = SCENE_MATCHING;
  handleFindOpponent(true);
}

export function stopFindingOpponent() {
  app.scene = SCENE_MENU;
  handleFindOpponent(false);
}

export function handleAuthentication(ctx) {
  app.token = ctx.token;
  playerId = ctx.playerId;
}

function handleFindOpponent(flag) {
  sendJson({
    type: FIND_OPPONENT,
    flag: !!flag,
  });
}

export function handleGameInfo(ctx) {
  app.scene = SCENE_PLAYING;
  app.game = new Game(ctx);
  if (ctx.blackPlayer.id == playerId) {
    playerInfo = ctx.blackPlayer;
    app.turn = ctx.turnColor == playerInfo.color;
  } else if (ctx.whitePlayer.id == playerId) {
    playerInfo = ctx.whitePlayer;
    app.turn = ctx.turnColor == playerInfo.color;
  }

  orbit.reset();
}

export function handleTurnUpdate(ctx) {
  if (playerInfo == null) {
    return;
  }
  app.turn = ctx.turnColor == playerInfo.color;
}

export function handleBoardUpdate(ctx) {
  if (app.game != null) {
    app.game.board = ctx.board;
  }
}

export function handleGameOver(ctx) {
  app.scene = SCENE_ENDING;
  app.result = ctx.result;
}

export function handleClickBoard(x, y) {
  if (x < 0 || x >= 8) {
    return;
  }

  if (y < 0 || y >= 8) {
    return;
  }
  sendJson({
    type: CLICK_BOARD,
    discX: x,
    discY: y,
  });
}

export function handleSpectate(ctx) {
  //TODO
}
