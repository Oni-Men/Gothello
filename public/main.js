const BG = "#6a8";
const BG_DARKER = "#153";
const WHITE = "#eee";
const BLACK = "#333";
const TRANSPARENT = "transparent";

const GAME_STATE_MAIN_MENU = 0;
const GAME_STATE_FINDING_OPPONENT = 1;
const GAME_STATE_PLAYING = 2;
const GAME_STATE_GAME_OVER = 3;

const FIND_OPPONENT = 0;
const OPPONENT_FOUND = 1;
const TURN_UPDATE = 2;
const DISC_PLACED = 3;
const DISC_UPDATED = 4;
const GAME_OVER = 5;
const CLICK_BOARD = 6;

const ws = new WebSocket(`ws://${window.location.host}/game`);
const canvas = document.querySelector("#canvas");
const g = canvas.getContext("2d");

const white_img = new Image();
const black_img = new Image();
const board_img = new Image();

board_img.src = "/img/board.png";
black_img.src = "/img/black.png";
white_img.src = "/img/white.png";

const name = localStorage.getItem("nickname") || window.prompt("プレイヤー名を決めてください");
localStorage.setItem("nickname", name);

const BOARD_SIZE = Math.min(canvas.width, canvas.height) * 0.8;
const GRID_SIZE = BOARD_SIZE / 8;

let effects = [];
const board = [];

let opponent_data;
let my_color = BG;
let my_turn = false;
let game_state = GAME_STATE_MAIN_MENU;
let result = {};

//SECTION RENDER START

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
		g.drawImage(img, 0, 0, GRID_SIZE, GRID_SIZE, disc.x - GRID_SIZE / 2, disc.y - GRID_SIZE / 2, GRID_SIZE, GRID_SIZE);
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

//SECTION RENDER END

//SECTION LOGIC START

function initBoard() {
	for (let y = 0; y < 8; y++) {
		board[y] = [];
		for (let x = 0; x < 8; x++) {
			setDisc(x, y, TRANSPARENT);
		}
	}

	board[3][3].color = WHITE;
	board[3][4].color = BLACK;
	board[4][3].color = BLACK;
	board[4][4].color = WHITE;

	updateGameInfo();
}

//x,yは盤面のマスを表し石の色を指定して盤にセットする
function setDisc(x, y, color) {
	const disc = {
		x: GRID_SIZE * 1.5 + x * GRID_SIZE,
		y: GRID_SIZE * 1.5 + y * GRID_SIZE,
		velocity: {
			x: 0,
			y: 0,
		},
		radius: GRID_SIZE * 0.4,
		color,
	};
	board[y][x] = disc;
	return disc;
}

function placeDisc(x, y, color) {
	const placed = setDisc(x, y, color);
	for (y = 0; y < 8; y++) {
		for (x = 0; x < 8; x++) {
			const disc = board[y][x];

			const distance = Math.hypot(placed.x - disc.x, placed.y - disc.y);

			if (distance > GRID_SIZE * 2) {
				continue;
			}

			// 石を設置した際に衝撃波を与える (カオスになる)
			// const radian = Math.atan2(placed.y - disc.y, placed.x - disc.x) + Math.PI;
			// const power = distance / 50;
			// disc.velocity.x = power * Math.cos(radian);
			// disc.velocity.y = power * Math.sin(radian);
		}
	}
}

function updateDisc(x, y, color) {
	board[y][x].color = color;
	const disc = board[y][x];
}

function spawnFlashEffect(x, y, life) {
	effects.push({
		life,
		x,
		y,
		render: (e) => {
			if ((e.life / 5) % 2 == 0) {
				g.fillStyle = "#fff";
				g.fillRect(0, 0, canvas.width, canvas.height);
			}
		},
	});
}

function startFindingOpponent() {
	game_state = GAME_STATE_FINDING_OPPONENT;
	sendJSON({
		Type: FIND_OPPONENT,
		MyName: name,
	});
}

function stopFindingOpponent() {
	game_state = GAME_STATE_MAIN_MENU;
	sendJSON({
		Type: FIND_OPPONENT,
	});
}

function clickBoard(x, y) {
	[x, y] = getBoardCoordinateFromMousePosition(x, y);

	if (x < 0 || x >= 8) {
		return;
	}

	if (y < 0 || y >= 8) {
		return;
	}

	sendJSON({
		Type: CLICK_BOARD,
		DiscX: Math.floor(x),
		DiscY: Math.floor(y),
	});
}

function resetGameState() {
	initBoard();
	game_state = GAME_STATE_MAIN_MENU;
}

//SECTION LOGIC END

//SECTION UTIL START

function countDiscByColor(color) {
	return board.flat().filter((d) => d.color == color).length;
}

function getBoardCoordinateFromMousePosition(x, y) {
	return [(x - GRID_SIZE * 1.5) / GRID_SIZE + 0.5, (y - GRID_SIZE * 1.5) / GRID_SIZE + 0.5];
}

function sendJSON(data) {
	try {
		ws.send(JSON.stringify(data));
	} catch (error) {
		resetGameState();
	}
}

function updateGameInfo() {
	const gameInfo = document.querySelector("#game-info");
	const me = gameInfo.querySelector("#me");
	const opponent = gameInfo.querySelector("#opponent");

	const updateName = (node, name) => {
		node.querySelector("#name").textContent = name;
	};

	const updatePoint = (node, point) => {
		node.querySelector("h3 #point").textContent = point;
	};

	const updateColor = (node, color) => {
		node.style.color = color;
	};

	if (opponent_data) {
		updateName(me, name);
		updatePoint(me, countDiscByColor(my_color));
		updateColor(me, my_color);

		updateName(opponent, opponent_data.name || "いません");
		updatePoint(opponent, countDiscByColor(opponent_data.color));
		updateColor(opponent, opponent_data.color);

		document.querySelector("#turn-info").textContent = `${my_turn ? "あなた" : "相手"}のターンです。`;
	}
}

//SECTION UTIL END

ws.onmessage = function (e) {
	const data = JSON.parse(e.data);

	switch (data.Type) {
		case OPPONENT_FOUND:
			opponent_data = {
				color: data.OpponentColor,
				name: data.OpponentName,
			};
			my_color = data.MyColor;
			game_state = GAME_STATE_PLAYING;
			break;
		case TURN_UPDATE:
			my_turn = data.TurnColor == my_color;
			break;
		case DISC_PLACED:
			placeDisc(data.DiscX, data.DiscY, data.DiscColor);
			break;
		case DISC_UPDATED:
			updateDisc(data.DiscX, data.DiscY, data.DiscColor);
			break;
		case GAME_OVER:
			result = data.Result;
			game_state = GAME_STATE_GAME_OVER;
	}
	updateGameInfo();
};

canvas.addEventListener("click", (event) => {
	const rect = canvas.getBoundingClientRect();
	let x = event.clientX - rect.left;
	let y = event.clientY - rect.top;

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
});

initBoard();

(function () {
	renderGlobal();
	window.requestAnimationFrame(arguments.callee);
})();
