package generator

import (
	"math/rand"
	"time"
)

var counter int64 = 0

func RandomID() int {
	counter++
	rand.Seed(time.Now().UnixNano())
	i := rand.Intn(10000)
	i = i<<16 | (int(counter) % 255)
	return i
}
