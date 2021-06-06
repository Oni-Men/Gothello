package game

import (
	"othello/game"
	"testing"
)

func TestGame(t *testing.T) {

	manager := game.NewManager()
	game := game.New(randomPlayer(), randomPlayer(), manager)

	manager.Add(game)

	game.ClickBoard(5, 3, game.TurnColor)
}
