import { SCENE_MATCHING, SCENE_MENU, SCENE_PLAYING } from "./define";
import app, { sendJson } from "./main";
import { Game } from "./game/game";

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
    nickname,
  });
}

export function handleGameInfo(ctx) {
  app.scene = SCENE_PLAYING;
  app.game = new Game(ctx);
}

export function handleTurnUpdate(ctx) {}

export function handleBoardUpdate(ctx) {
  app.board = ctx.board;
}

export function handleGameOver(ctx) {}

export function handleClickBoard(ctx) {}

export function handleSpectate(ctx) {}

export function handleAuthentication(ctx) {
  app.token = ctx.token;
  app.id = ctx.gameId;
}
