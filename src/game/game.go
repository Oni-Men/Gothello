package game

//Game オセロのゲームを管理する
type Game struct {
	id          int
	manager     *Manager
	Board       [8][8]Disc
	BlackPlayer *Player
	WhitePlayer *Player
	Spectators  [16]*Player
	TurnColor   Disc
	Broadcast   chan Message
	pass        int
	CanPlace    bool
	GameOvered  bool
}

//New 新しいゲームを作成します
func New(p1, p2 *Player, manager *Manager) *Game {
	game := new(Game)

	game.id = RandomID()
	game.manager = manager

	game.InitBoard()
	game.BlackPlayer = p1
	game.WhitePlayer = p2

	game.updateTurn()

	return game
}

//ok
func (g *Game) InitBoard() {
	g.Board[3][3] = DiscWhite
	g.Board[3][4] = DiscBlack
	g.Board[4][3] = DiscBlack
	g.Board[4][4] = DiscWhite
}

//ok
func (g *Game) ClickBoard(x, y int, color Disc) {
	if g.Board[y][x] == DiscTransparent {

		flippables, n := g.getFlippableDiscs(x, y)
		f := false
		c := 0

		println(n)

		for i := 0; i < 0; i++ {
			for k := 0; k < 8; k++ {
				if flippables[i][k] == 0 {
					continue
				}

				f = true
				g.Board[i][k] = color

				_, n := g.getFlippableDiscs(k, i)
				c += n
			}
		}

		if c > 0 {
			g.CanPlace = true
		} else {
			g.CanPlace = false
		}

		if f {
			g.Board[y][x] = color
			g.noticeBoardUpdate()
			g.updateTurn()
		}
	}
}

//ok
func (g *Game) updateTurn() {
	if g.GameOvered {
		return
	}

	if g.pass > 2 {
		g.noticeGameOver(nil)
	}

	switch g.TurnColor {
	case DiscTransparent:
		g.TurnColor = DiscBlack
	case DiscBlack:
		g.TurnColor = DiscWhite
	case DiscWhite:
		g.TurnColor = DiscBlack
	}

	g.noticeAll(&Context{
		Type:      TurnUpdate,
		TurnColor: g.TurnColor,
	})

	// if g.canPlaceDisc() {
	// 	g.pass = 0
	// } else {
	// 	g.pass++
	// 	g.updateTurn()
	// }
}

//ok
func (g *Game) noticeBoardUpdate() {

	if g.GameOvered {
		return
	}

	g.noticeAll(&Context{
		Type:  BoardUpdate,
		Board: g.Board,
	})
}

//ok
func (g *Game) noticeGameOver(winner *Player) {
	white, black := 0, 0

	for y := 0; y < 8; y++ {
		for x := 0; x < 8; x++ {
			disc := g.Board[y][x]

			switch disc {
			case DiscBlack:
				black++
			case DiscWhite:
				white++
			}
		}
	}

	if winner == nil {
		if white > black {
			winner = g.WhitePlayer
		} else {
			winner = g.BlackPlayer
		}
	}

	g.noticeAll(&Context{
		Type: GameOver,
		Result: GameResult{
			ID:     g.id,
			Black:  black,
			White:  white,
			Winner: winner.Name,
		},
	})

	g.GameOvered = true
	g.manager.Remove(g.id)
}

func (g *Game) canPlaceDisc() bool {
	c := 0
	for y := 0; y < 8; y++ {
		for x := 0; x < 8; x++ {
			if g.Board[y][x] == DiscTransparent {
				c++
			}
		}
	}

	if c == 0 {
		g.noticeGameOver(nil)
		return false
	}

	return g.CanPlace
}

func (g *Game) getFlippableDiscs(sx, sy int) (*[8][8]byte, int) {
	n := 0
	flippables := &[8][8]byte{}
	n += g.flippablesOfLine(sx, sy, 1, 0, flippables)
	n += g.flippablesOfLine(sx, sy, -1, 0, flippables)
	n += g.flippablesOfLine(sx, sy, 0, 1, flippables)
	n += g.flippablesOfLine(sx, sy, 0, -1, flippables)
	n += g.flippablesOfLine(sx, sy, 1, -1, flippables)
	n += g.flippablesOfLine(sx, sy, -1, 1, flippables)
	n += g.flippablesOfLine(sx, sy, 1, 1, flippables)
	n += g.flippablesOfLine(sx, sy, -1, -1, flippables)
	return flippables, n
}

func (g *Game) flippablesOfLine(x, y, tx, ty int, flippables *[8][8]byte) int {
	n := 0
	c := g.Board[y][x]

	tmp := &[8][8]byte{}

	for {
		x, y = x+tx, y+ty

		if x < 0 || x >= 8 || y < 0 || y >= 8 {
			tmp = nil
			break
		}

		d := g.Board[y][x]

		if d == DiscTransparent {
			tmp = nil
			break
		}

		if d == c {
			break
		}

		tmp[y][x] = 1

	}

	if tmp == nil {
		return 0
	}

	for y := 0; y < 8; y++ {
		for x := 0; x < 8; x++ {
			if flippables[y][x] != 0 {
				continue
			}

			flippables[y][x] = tmp[y][x]
			if tmp[y][x] == 1 {
				n++
			}
		}
	}

	return n
}

func (g *Game) ID() int {
	return g.id
}

//ok
func (g *Game) noticeAll(ctx *Context) {
	g.BlackPlayer.Send(ctx)
	g.WhitePlayer.Send(ctx)
	for _, p := range g.Spectators {
		p.Send(ctx)
	}
}

//todo
func (g *Game) GameOverByExit(player *Player) {
	for _, p := range g.Spectators {
		if p.ID != player.ID {
			g.noticeGameOver(p)
			break
		}
	}
}
