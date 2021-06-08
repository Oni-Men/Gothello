export class Game {
	constructor(gameInfo) {
		this.applyGameInfo(gameInfo);
	}

	applyGameInfo(gameInfo) {
		this.id = gameInfo.id;
		this.board = gameInfo.Board;
		this.blackPlayer = gameInfo.BlackPlayer;
		this.whitePlayer = gameInfo.whitePlayer;
		this.turnColor = gameInfo.turnColor;
		this.gameOvered = gameInfo.gameOvered;
	}
}
