package disc

type Disc int8

const (
	White Disc = iota - 1
	None
	Black
)

func (d *Disc) Flip() {
	*d *= -1
}

func (d *Disc) IsNone() bool {
	return *d == None
}
