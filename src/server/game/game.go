package game

import "othello/generator"

//Game オセロのゲームを管理する
type Game struct {
	id          int
	manager     *Manager
	Board       [8][8]Disc
	BlackPlayer *Player
	WhitePlayer *Player
	Spectators  []*Player
	TurnColor   Disc
	Broadcast   chan Message
	pass        int
	GameOvered  bool
	Process     []byte
}

//New 新しいゲームを作成します
func New(p1, p2 *Player, manager *Manager) *Game {
	g := &Game{
		id:          generator.RandomID(),
		BlackPlayer: p1,
		WhitePlayer: p2,
		manager:     manager,
		Process:     make([]byte, 0, 60),
	}

	g.Board[3][3] = DiscWhite
	g.Board[3][4] = DiscBlack
	g.Board[4][3] = DiscBlack
	g.Board[4][4] = DiscWhite

	g.TurnColor = DiscBlack

	return g
}

//ok
func (g *Game) ClickBoard(x, y int) {
	if x < 0 || x >= 8 || y < 0 || y >= 8 {
		return
	}

	if g.Board[y][x] == DiscTransparent {

		flippables, _ := g.getFlippableDiscs(x, y)
		flipped := false

		c := 0
		for i := 0; i < 8; i++ {
			for k := 0; k < 8; k++ {
				if flippables[i][k] == 0 {
					continue
				}

				flipped = true
				g.Board[i][k] = g.TurnColor

				_, n := g.getFlippableDiscs(k, i)
				c += n
			}
		}

		if flipped {
			g.Process = append(g.Process, byte(y*8+x))
			g.Board[y][x] = g.TurnColor
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
		return
	}

	switch g.TurnColor {
	case DiscTransparent:
		g.TurnColor = DiscBlack
	case DiscBlack:
		g.TurnColor = DiscWhite
	case DiscWhite:
		g.TurnColor = DiscBlack
	}

	if g.canPlaceDisc() {
		g.pass = 0
	} else {
		g.pass++
		g.updateTurn()
	}

	g.noticeAll(&Context{
		Type:      TurnUpdate,
		TurnColor: g.TurnColor,
	})

	g.noticeBoardUpdate()
}

//ok
func (g *Game) noticeBoardUpdate() {
	if g.GameOvered {
		return
	}

	g.noticeAll(&Context{
		Type:  BoardUpdate,
		Board: &g.Board,
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
		Result: &GameResult{
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
				_, n := g.getFlippableDiscs(x, y)
				c += n
			}

		}
	}

	if c == 0 {
		g.noticeGameOver(nil)
		return false
	}

	return true
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
	flipped := &[8][8]byte{}

	for {
		x, y = x+tx, y+ty

		if x < 0 || x >= 8 || y < 0 || y >= 8 {
			flipped = nil
			break
		}

		d := g.Board[y][x]

		if d == DiscTransparent {
			flipped = nil
			break
		}

		if d == g.TurnColor {
			break
		}

		flipped[y][x] = 1
	}

	if flipped == nil {
		return 0
	}

	for y = 0; y < 8; y++ {
		for x = 0; x < 8; x++ {
			if flipped[y][x] == 1 {
				flippables[y][x] = flipped[y][x]
				n++
			}
		}
	}

	return n
}

func (g *Game) ID() int {
	return g.id
}

func (g *Game) IsTurnPlayer(p *Player) bool {
	switch g.TurnColor {
	case DiscBlack:
		return p == g.BlackPlayer
	case DiscWhite:
		return p == g.WhitePlayer
	}
	return false
}

//ok
func (g *Game) noticeAll(ctx *Context) {
	g.BlackPlayer.Send(ctx)
	g.WhitePlayer.Send(ctx)
	for _, p := range g.Spectators {
		p.Send(ctx)
	}
}

func (g *Game) GameOverByExit(player *Player) {
	if player == nil {
		return
	}

	switch player {
	case g.BlackPlayer:
		g.noticeGameOver(g.WhitePlayer)
	case g.WhitePlayer:
		g.noticeGameOver(g.BlackPlayer)
	}
}
