export class Board {
	constructor() {
		this.board = Array(8)
			.fill()
			.map(() => Array(8).fill(0));
	}

	update(ctx) {
		this.board = ctx.Board;
	}
}
