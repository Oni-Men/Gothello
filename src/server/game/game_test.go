package game

import (
	"othello/player"
	"testing"
)

func TestGame(t *testing.T) {

	manager := NewManager()
	g := NewGame(player.NewRandomPlayer(), player.NewRandomPlayer(), manager)

	manager.Add(g)

	g.ClickBoard(5, 3)
}
