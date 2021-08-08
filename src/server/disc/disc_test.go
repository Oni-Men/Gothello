package disc_test

import (
	"othello/disc"
	"testing"
)

func TestDiscFlip(t *testing.T) {

	white := disc.White
	black := disc.Black

	if white == black {
		t.Fatalf("expect white != black, but white == black")
	}

	white.Flip()
	println(white)
	println(black)

	if white != black {
		t.Fatalf("expect white == black. but white != black")
	}
}
