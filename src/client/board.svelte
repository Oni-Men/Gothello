<script>
	export let canvas;
	const g = canvas.getContext("2d");

	function clickHandler(e) {
		const rect = canvas.getBoundingClientRect();
		let x = e.clientX - rect.left;
		let y = e.clientY - rect.top;

		switch (game_state) {
			case GAME_STATE_MAIN_MENU:
				startFindingOpponent();
				break;
			case GAME_STATE_FINDING_OPPONENT:
				stopFindingOpponent();
				break;
			case GAME_STATE_PLAYING:
				clickBoard(x, y);
				break;
			case GAME_STATE_GAME_OVER:
				resetGameState();
				break;
		}
	}

	function renderGlobal() {
		g.fillStyle = BG;
		fillCanvas();

		renderBoardBackground();
		renderAllDiscs();

		effects.forEach((e) => {
			e.render(e);
			e.life--;
		});
		effects = effects.filter((e) => e.life > 0);

		switch (game_state) {
			case GAME_STATE_MAIN_MENU:
				renderMainMenu();
				break;
			case GAME_STATE_FINDING_OPPONENT:
				renderFindingOpponent();
				break;
			case GAME_STATE_GAME_OVER:
				renderGameOver();
				break;
		}
	}

	function renderBoardBackground() {
		if (board_img.complete) {
			g.drawImage(board_img, 0, 0, 500, 500, 0, 0, 500, 500);
		}
	}

	function renderAllDiscs() {
		for (let y = 0; y < board.length; y++) {
			for (let x = 0; x < board[y].length; x++) {
				const disc = board[y][x];
				renderDisc(disc);
			}
		}
	}

	function renderDisc(disc) {
		disc.x += disc.velocity.x;
		disc.y += disc.velocity.y;

		disc.velocity.x *= 0.9;
		disc.velocity.y *= 0.9;

		let img = null;
		if (disc.color == BLACK) {
			img = black_img;
		} else if (disc.color == WHITE) {
			img = white_img;
		}
		if (img != null && img.complete) {
			g.drawImage(
				img,
				0,
				0,
				GRID_SIZE,
				GRID_SIZE,
				disc.x - GRID_SIZE / 2,
				disc.y - GRID_SIZE / 2,
				GRID_SIZE,
				GRID_SIZE
			);
		}
	}

	function renderMenuBackground() {
		g.fillStyle = BLACK;
		g.globalAlpha = 0.5;
		fillCanvas();
		g.globalAlpha = 1.0;
	}

	function renderMainMenu() {
		renderMenuBackground();
		g.fillStyle = WHITE;
		g.font = "24px serif";
		g.textAlign = "center";
		g.textBaseline = "middle";
		g.fillText("画面クリックで", canvas.width / 2, canvas.height / 2 - 12);
		g.fillText("対戦相手の検索を開始します", canvas.width / 2, canvas.height / 2 + 12);
	}

	function renderFindingOpponent() {
		renderMenuBackground();
		g.fillStyle = WHITE;
		g.font = "24px serif";
		g.textAlign = "center";
		g.textBaseline = "middle";
		g.fillText("対戦相手を検索中...", canvas.width / 2, canvas.height / 2);
	}

	function renderGameOver() {
		renderMenuBackground();
		g.fillStyle = WHITE;
		g.font = "24px serif";
		g.textAlign = "center";
		g.textBaseline = "middle";
		g.fillText(`終了！勝者は${result.Winner}`, canvas.width / 2, canvas.height / 2);
	}

	function fillCanvas() {
		g.fillRect(0, 0, canvas.width, canvas.height);
	}
</script>

<canvas on:click={clickHandler} />
