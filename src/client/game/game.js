export class Game {
  constructor(gameInfo) {
    this.applyGameInfo(gameInfo);
  }

  applyGameInfo(gameInfo) {
    this.id = gameInfo.gameId;
    this.board = gameInfo.board;
    this.blackPlayer = gameInfo.blackPlayer;
    this.whitePlayer = gameInfo.whitePlayer;
    this.turnColor = gameInfo.turnColor;
    this.gameOvered = gameInfo.gameOvered;
  }
}
