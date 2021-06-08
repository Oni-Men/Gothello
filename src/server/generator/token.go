package generator

import (
	"math/rand"
	"time"
)

const pool = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

func init() {
	rand.Seed(time.Now().UnixNano())
}

//Token トークンを生成する(参考: https://qiita.com/srtkkou/items/ccbddc881d6f3549baf1)
func Token(n int) string {
	b := make([]byte, n)
	r := rand.Int63()

	for i := 0; i < n; i++ {
		b[i] = pool[int(r&51)]
		r >>= 8
		if r < 52 {
			r = rand.Int63()
		}
	}
	rand.Seed(time.Now().UnixNano())
	return string(b)
}
