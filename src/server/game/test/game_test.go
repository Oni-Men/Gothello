package game

import (
	"othello/game"
	"othello/player"
	"testing"
)

func TestGame(t *testing.T) {

	manager := game.NewManager()
	game := game.New(player.NewRandomPlayer(), player.NewRandomPlayer(), manager)

	manager.Add(game)

	game.ClickBoard(5, 3)
}
