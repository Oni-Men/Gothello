package game

import (
	"othello/game"
	"testing"
)

func TestGame(t *testing.T) {

	manager := game.NewManager()
	game := game.New(RandomPlayer(), RandomPlayer(), manager)

	manager.Add(game)

	game.ClickBoard(5, 3)
}
