package game

import (
	"othello/player"
	"testing"
)

func TestManager(t *testing.T) {

	m := NewManager()

	games := []*Game{
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

func randomGame(m *Manager) *Game {
	a := player.New("A", nil)
	b := player.New("B", nil)

	return NewGame(a, b, m)
}
