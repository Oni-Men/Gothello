package game

import (
	"othello/disc"
	"othello/generator"

	"othello/network"
	"othello/player"
)

//Game オセロのゲームを管理する
type Game struct {
	id          int
	manager     *Manager
	Board       [8][8]disc.Disc
	BlackPlayer *player.Player
	WhitePlayer *player.Player
	Spectators  []*player.Player
	TurnColor   disc.Disc
	Broadcast   chan Message
	pass        int
	GameOvered  bool
	Process     []byte
}

//NewGame 新しいゲームを作成します
func NewGame(p1, p2 *player.Player, manager *Manager) *Game {
	g := &Game{
		id:          generator.RandomID(),
		BlackPlayer: p1,
		WhitePlayer: p2,
		manager:     manager,
		Process:     make([]byte, 0, 60),
	}

	g.Board[3][3] = disc.White
	g.Board[3][4] = disc.Black
	g.Board[4][3] = disc.Black
	g.Board[4][4] = disc.White

	g.TurnColor = disc.Black

	return g
}

// ClickBoard Process click information sent by the client.
func (g *Game) ClickBoard(cx, cy int) {
	if cx < 0 || cx >= 8 || cy < 0 || cy >= 8 {
		return
	}

	if !g.Board[cy][cx].IsNone() {
		return
	}

	flippables, _ := g.getFlippableDiscs(cx, cy)
	flipped := false

	count := 0
	for y := 0; y < 8; y++ {
		for x := 0; x < 8; x++ {
			if flippables[y][x] == 0 {
				continue
			}

			flipped = true
			g.Board[y][x] = g.TurnColor

			_, n := g.getFlippableDiscs(x, y)
			count += n
		}
	}

	if flipped {
		g.Process = append(g.Process, byte(cy*8+cx))
		g.Board[cy][cx] = g.TurnColor
		g.noticeBoardUpdate()
		g.updateTurn()
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

	g.TurnColor.Flip()

	if g.canPlaceDisc() {
		g.pass = 0
	} else {
		g.pass++
		g.updateTurn()
	}

	g.noticeAll(&network.Context{
		Type:      network.TurnUpdate,
		TurnColor: g.TurnColor,
	})

	g.noticeBoardUpdate()
}

//ok
func (g *Game) noticeBoardUpdate() {
	if g.GameOvered {
		return
	}

	g.noticeAll(&network.Context{
		Type:  network.BoardUpdate,
		Board: &g.Board,
	})
}

//ok
func (g *Game) noticeGameOver(winner *player.Player) {
	white, black := 0, 0

	for y := 0; y < 8; y++ {
		for x := 0; x < 8; x++ {
			d := g.Board[y][x]

			switch d {
			case disc.Black:
				black++
			case disc.White:
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

	g.noticeAll(&network.Context{
		Type: network.GameOver,
		Result: &network.GameResult{
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
			if g.Board[y][x].IsNone() {
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

		if d.IsNone() {
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

func (g *Game) IsTurnPlayer(p *player.Player) bool {
	switch g.TurnColor {
	case disc.Black:
		return p == g.BlackPlayer
	case disc.White:
		return p == g.WhitePlayer
	}
	return false
}

//ok
func (g *Game) noticeAll(ctx *network.Context) {
	ctx.Send(g.BlackPlayer)
	ctx.Send(g.WhitePlayer)
	for _, p := range g.Spectators {
		ctx.Send(p)
	}
}

func (g *Game) GameOverByExit(player *player.Player) {
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
