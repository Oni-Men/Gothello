package game

import (
	"math/rand"
	"othello/game"
	"strings"
	"testing"
)

func TestQueuePushAndPop(t *testing.T) {
	q := game.NewQueue()

	players := []*game.Player{
		randomPlayer(),
		randomPlayer(),
		randomPlayer(),
		randomPlayer(),
		randomPlayer(),
		randomPlayer(),
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
	q := game.NewQueue()

	players := []*game.Player{
		randomPlayer(),
		randomPlayer(),
		randomPlayer(),
		randomPlayer(),
		randomPlayer(),
		randomPlayer(),
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

func randomPlayer() *game.Player {
	return &game.Player{
		ID:   game.RandomID(),
		Name: randomName(6),
	}
}

var pool = "abcdefghijklmnopqrstuvwxyz0123456789"

func randomName(n int) string {
	buf := make([]string, 0, n)
	for n >= 0 {
		n--
		rand.Seed(int64(n))
		buf = append(buf, string([]rune(pool)[rand.Intn(len(pool))]))
	}

	return strings.Join(buf, "")
}
