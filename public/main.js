const BG = "#6a8";
const GRID_COLOR = "#153";
const WHITE = 1;
const BLACK = 2;
const TRANSPARENT = 0;

const DISC_COLOR = ["#0000", "#ffff", "#333f"];

const GAME_STATE_MAIN_MENU = 0;
const GAME_STATE_FINDING_OPPONENT = 1;
const GAME_STATE_PLAYING = 2;
const GAME_STATE_GAME_OVER = 3;

const FIND_OPPONENT = 0;
const GAME_INFO = 1;
const TURN_UPDATE = 2;
const BOARD_UPDATE = 3;
const GAME_OVER = 4;
const CLICK_BOARD = 5;
const SPECTATE = 6;
const AUTHENTICATION = 7;

let token = "";
let playerId = 0;

//const ws = new WebSocket(`ws://${window.location.host}/game`);
const ws = new WebSocket(`ws://localhost/game`);
const canvas = document.querySelector("#canvas");
const g = canvas.getContext("2d");

const name = localStorage.getItem("nickname") || window.prompt("プレイヤー名を決めてください");
localStorage.setItem("nickname", name);

const BOARD_SIZE = Math.min(canvas.width, canvas.height) * 0.8;
const GRID_SIZE = BOARD_SIZE / 8;

let board = [];
let game_state = GAME_STATE_MAIN_MENU;
let result = {};

//SECTION RENDER START

function renderGlobal() {
	g.fillStyle = BG;
	fillCanvas();

	renderBoardBackground();
	renderAllDiscs();

	g.setTransform(1, 0, 0, 1, 1, 1);

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
	g.strokeStyle = GRID_COLOR;
	g.lineWidth = 1.5;

	g.setTransform(1, 0, 0, 1, 1, 1);
	g.translate(canvas.width * 0.1, canvas.height * 0.1);

	for (let i = 0; i < 9; i++) {
		g.beginPath();
		g.moveTo(canvas.width * 0.0, canvas.height * 0.1 * i);
		g.lineTo(canvas.width * 0.8, canvas.height * 0.1 * i);
		g.stroke();

		g.beginPath();
		g.moveTo(canvas.width * 0.1 * i, canvas.height * 0.0);
		g.lineTo(canvas.width * 0.1 * i, canvas.height * 0.8);
		g.stroke();
	}
}

function renderAllDiscs() {
	const s = (canvas.width * 0.1 + canvas.height * 0.1) / 2;

	g.setTransform(1, 0, 0, 1, 1, 1);
	g.translate(s * 1.5, s * 1.5);

	for (let y = 0; y < board.length; y++) {
		for (let x = 0; x < board[y].length; x++) {
			g.fillStyle = DISC_COLOR[board[y][x]];
			g.beginPath();
			g.arc(x * s, y * s, s * 0.4, 0, 2 * Math.PI);
			g.fill();
		}
	}
}

function renderMenuBackground() {
	g.globalAlpha = 0.3;
	g.fillStyle = "#339";
	fillCanvas();
	g.globalAlpha = 1.0;
}

function renderMainMenu() {
	renderMenuBackground();
	g.fillStyle = "#fff";
	g.font = "24px sans";
	g.textAlign = "center";
	g.textBaseline = "middle";
	g.fillText("画面クリックで", canvas.width / 2, canvas.height / 2 - 12);
	g.fillText("対戦相手の検索を開始します", canvas.width / 2, canvas.height / 2 + 12);
}

function renderFindingOpponent() {
	renderMenuBackground();
	g.fillStyle = "#fff";
	g.font = "24px sans";
	g.textAlign = "center";
	g.textBaseline = "middle";
	g.fillText("対戦相手を検索中...", canvas.width / 2, canvas.height / 2);
}

function renderGameOver() {
	renderMenuBackground();
	g.fillStyle = "#fff";
	g.font = "24px sans";
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
	board = Array(8)
		.fill()
		.map(() => Array(8).fill(TRANSPARENT));
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

function startFindingOpponent() {
	game_state = GAME_STATE_FINDING_OPPONENT;
	sendJSON({
		Type: FIND_OPPONENT,
		Nickname: name,
	});
}

function stopFindingOpponent() {
	game_state = GAME_STATE_MAIN_MENU;
	sendJSON({
		Type: FIND_OPPONENT,
	});
}

function clickBoard(x, y) {
	[x, y] = mousePosToDiscXY(x, y);

	if (x < 0 || x >= 8) {
		return;
	}

	if (y < 0 || y >= 8) {
		return;
	}

	sendJSON({
		Type: CLICK_BOARD,
		DiscX: x,
		DiscY: y,
	});
}

function resetGameState() {
	//initBoard();
	game_state = GAME_STATE_MAIN_MENU;
}

//SECTION LOGIC END

//SECTION UTIL START

function countDiscByColor(color) {
	return board.flat().filter((d) => d.color == color).length;
}

function mousePosToDiscXY(x, y) {
	const scale = (canvas.width * 0.1 + canvas.height * 0.1) / 2;
	return [Math.floor((x - scale * 1.5) / scale + 0.5), Math.floor((y - scale * 1.5) / scale + 0.5)];
}

function sendJSON(data) {
	if (token != null) {
		data.Token = token;
	}

	try {
		ws.send(JSON.stringify(data));
	} catch (error) {
		resetGameState();
	}
}

//SECTION UTIL END

ws.onmessage = function (e) {
	const data = JSON.parse(e.data);

	switch (data.Type) {
		case GAME_INFO:
			game_state = GAME_STATE_PLAYING;
			break;
		case TURN_UPDATE:
			break;
		case BOARD_UPDATE:
			board = data.Board;
			break;
		case GAME_OVER:
			result = data.Result;
			game_state = GAME_STATE_GAME_OVER;
			break;
		case AUTHENTICATION:
			token = data.Token;
			playerId = data.PlayerID;
			break;
	}
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
