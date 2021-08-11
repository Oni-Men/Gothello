package generator

import (
	"testing"
)

//テストの結果から、同じ文字が4個以上含まれる確率はかなり低いはず
func TestToken(t *testing.T) {
	fail := 0
	for i := 0; i < 100; i++ {
		if !validateToken(t, 4) {
			fail++
		}
	}

	if fail > 1 {
		t.Fatalf("Failed %d/100", fail)
	}
}

func validateToken(t *testing.T, n int) bool {
	token := NewToken(16)

	if len(token) != 16 {
		t.Logf("len(token) is not 16")
		return false
	}

	chars := make(map[rune]int)

	for _, s := range token {
		c, ok := chars[s]
		if ok {
			chars[s] = c + 1
		} else {
			chars[s] = 0
		}
	}

	for _, v := range chars {
		if v >= n {
			return false
		}
	}

	return true
}
