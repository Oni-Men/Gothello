import { SCENE_ENDING, SCENE_MATCHING, SCENE_MENU, SCENE_PLAYING } from "./define";
import app, { sendJson } from "./main";
import { Game } from "./game/game";
import { orbit } from "./render/render";

export const FIND_OPPONENT = 0;
export const GAME_INFO = 1;
export const TURN_UPDATE = 2;
export const BOARD_UPDATE = 3;
export const GAME_OVER = 4;
export const CLICK_BOARD = 5;
export const SPECTATE = 6;
export const AUTHENTICATION = 7;

export const Handlers = [
  handleFindOpponent,
  handleGameInfo,
  handleTurnUpdate,
  handleBoardUpdate,
  handleGameOver,
  handleClickBoard,
  handleSpectate,
  handleAuthentication,
];

let playerId = 0;
let playerInfo = null;

export function startFindingOpponent() {
  let nickname = localStorage.getItem("nickname");

  if (!nickname) {
    nickname = window.prompt("ニックネームを決めてください");
    localStorage.setItem("nickname", nickname);
  }

  app.scene = SCENE_MATCHING;
  handleFindOpponent(nickname);
}

export function stopFindingOpponent() {
  app.scene = SCENE_MENU;
  handleFindOpponent(null);
}

function handleFindOpponent(nickname) {
  sendJson({
    type: FIND_OPPONENT,
    nickname: nickname,
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
  //playerInfo is null means spectating mode.
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

//TODO
export function handleSpectate(ctx) {}

export function handleAuthentication(ctx) {
  app.token = ctx.token;
  playerId = ctx.playerId;
}
