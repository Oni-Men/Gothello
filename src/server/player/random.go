package player

import (
	"math/rand"
	"othello/generator"
	"strings"
)

const pool = "abcdefghijklmnopqrstuvwxyz0123456789"

func NewRandomPlayer() *Player {
	return &Player{
		ID:   generator.RandomID(),
		Name: randomName(6),
	}
}

func randomName(n int) string {
	buf := make([]string, 0, n)
	for n >= 0 {
		n--
		rand.Seed(int64(n))
		buf = append(buf, string([]rune(pool)[rand.Intn(len(pool))]))
	}

	return strings.Join(buf, "")
}
