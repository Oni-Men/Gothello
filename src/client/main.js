import App from "./App.svelte";
import * as Define from "./define.js";
import { Player } from "./game/player";

var self = null;
var opponent = null;
var board = null;

// const ws = new WebSocket(`ws://${window.location.host}/game`);
const ws = new WebSocket(`ws://localhost/game`);
ws.onmessage = function (e) {
	const data = JSON.parse(e.data);

	switch (data.Type) {
		case Define.GAME_INFO:
			opponent = new Player(data.OpponentName, OpponentColor);
			self.color = data.MyColor;
			game_state = GAME_STATE_PLAYING;
			break;
		case Define.TURN_UPDATE:
			my_turn = data.TurnColor == my_color;
			break;
		case Define.BOARD_UPDATE:
			board.update(data);
			break;
		case GAME_OVER:
			result = data.Result;
			game_state = GAME_STATE_GAME_OVER;
	}
	updateGameInfo();
};

const app = new App({
	target: document.body,
	props: {
		name: localStorage.getItem("nickname"),
		game: null,
		token: null,
	},
});

export function sendJson(data) {
	try {
		ws.send(JSON.stringify(data));
	} catch (error) {
		resetGameState();
	}
}

export default app;
