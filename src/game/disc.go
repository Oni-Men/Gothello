package game

//DiscWhite 白の石を表します
const DiscWhite = "#eee"

//DiscBlack 黒の石を表します
const DiscBlack = "#333"

//DiscTransparent 透明の表します
const DiscTransparent = "transparent"

// Disc オセロの石です
type Disc struct {
	X     int
	Y     int
	Color string
}

func NewDisc(x, y int) *Disc {
	d := &Disc{
		X:     x,
		Y:     y,
		Color: DiscTransparent,
	}
	return d
}

func (d *Disc) Flip() {
	switch d.Color {
	case DiscWhite:
		d.Color = DiscBlack
	case DiscBlack:
		d.Color = DiscWhite
	}
}
