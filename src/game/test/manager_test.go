package game

import (
	"othello/game"
	"testing"
)

func TestManager(t *testing.T) {

	m := game.NewManager()

	games := []*game.Game{
		randomGame(m),
		randomGame(m),
		randomGame(m),
		randomGame(m),
	}

	for _, g := range games {
		m.Add(g)
	}

	for _, g := range games {
		e, ok := m.Get(g.ID())

		if !ok {
			t.Fatalf("Could not get game by Id")
		}

		if e.ID() != g.ID() {
			t.Fatalf("Get: Expected id is %d but got %d", g.ID(), e.ID())
		}
	}

	for _, g := range games {
		e, ok := m.Remove(g.ID())

		if !ok {
			t.Fatalf("Could not remove game by Id")
		}

		if e.ID() != g.ID() {
			t.Fatalf("Remove: Expected id is %d but got %d", g.ID(), e.ID())
		}
	}
}

func randomGame(m *game.Manager) *game.Game {
	a := game.NewPlayer("A", nil)
	b := game.NewPlayer("B", nil)

	return game.New(a, b, m)
}
