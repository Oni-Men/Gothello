export const FIND_OPPONENT = 0;
export const GAME_INFO = 1;
export const TURN_UPDATE = 2;
export const BOARD_UPDATE = 3;
export const GAME_OVER = 4;
export const CLICK_BOARD = 5;
export const SPECTATE = 6;
export const AUTHENTICATION = 7;

export function startFindingOpponent() {
	handleFindOpponent(nickname);
}

export function stopFindingOpponent() {
	handleFindOpponent("");
}

function handleFindOpponent(nickname) {
	game_state = GAME_STATE_FINDING_OPPONENT;
	sendJSON({
		Type: FIND_OPPONENT,
		Nickname: nickname,
	});
}

export function handleOpponentFound(ctx) {}

export function handleTurnUpdate(ctx) {}

export function handleBoardUpdate(ctx) {
	board = ctx.Board;
}

export function handleGameOver(ctx) {}
