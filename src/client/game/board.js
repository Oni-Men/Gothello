export class Board {
	constructor(blackPlayer, whitePlayer) {
		this.blackPlayer = blackPlayer;
		this.whitePlayer = whitePlayer;
		this.board = Array(8)
			.fill()
			.map(() => Array(8).fill(0));
	}

	update(ctx) {
		this.board = ctx.Board;
	}

	/**
	 * (x, y)にある石のデータを取得する。ボードの外を指定した場合-1を返す
	 * @param {number} x
	 * @param {number} y
	 * @returns {number}
	 */
	get(x, y) {
		if (x < 0 || x >= 8 || y < 0 || y >= 8) {
			return -1;
		}
		return this.board[y][x];
	}
}
