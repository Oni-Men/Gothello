package player

import (
	"testing"
)

func TestQueuePushAndPop(t *testing.T) {
	q := NewQueue()

	players := []*Player{
		NewRandomPlayer(),
		NewRandomPlayer(),
		NewRandomPlayer(),
		NewRandomPlayer(),
		NewRandomPlayer(),
		NewRandomPlayer(),
	}

	for _, p := range players {
		q.Push(p)
	}

	for _, p := range players {
		e := q.Pop()

		if e == nil {
			t.Fatalf("e is nil")
		}

		if e.Name != p.Name {
			t.Fatalf("expected %s but got %s", p.Name, e.Name)
		}
	}
}

func TestQueueRemove(t *testing.T) {
	q := NewQueue()

	players := []*Player{
		NewRandomPlayer(),
		NewRandomPlayer(),
		NewRandomPlayer(),
		NewRandomPlayer(),
		NewRandomPlayer(),
		NewRandomPlayer(),
	}

	for _, p := range players {
		q.Push(p)
	}

	p := q.Remove(players[2])

	if q.Length() != 5 {
		t.Fatalf("q length is not 5")
	}

	if p == nil {
		t.Fatalf("p is nil")
	}

	if p.Name != players[2].Name {
		t.Fatalf("Expected name is %s, got %s", players[2].Name, p.Name)
	}

}
