package game

import (
	"othello/network"
)

//Game オセロのゲームを管理する
type Game struct {
	id             int
	manager        *Manager
	Board          [8][8]*Disc
	Players        [2]*Player
	TurnColor      string
	Broadcast      chan Message
	PassContinuous int
	GameOvered     bool
}

//New 新しいゲームを作成します
func New(p1, p2 *Player, manager *Manager) *Game {
	game := new(Game)

	game.id = RandomID()
	game.manager = manager

	game.InitBoard()
	game.Players[0], game.Players[1] = p1, p2

	game.updateTurn()

	return game
}

func (g *Game) InitBoard() {
	for y := 0; y < 8; y++ {
		for x := 0; x < 8; x++ {
			g.Board[y][x] = NewDisc(x, y)
		}
	}

	g.Board[3][3].Color = DiscWhite
	g.Board[3][4].Color = DiscBlack
	g.Board[4][3].Color = DiscBlack
	g.Board[4][4].Color = DiscWhite

}

func (g *Game) ClickBoard(x, y int, color string) {
	disc := g.Board[y][x]

	if disc.Color == DiscTransparent {
		disc.Color = color

		betweens := g.findBetweenDiscs(disc)

		if len(betweens) > 0 {
			g.noticeDiscPlaced(disc)

			for _, d := range betweens {
				d.Color = disc.Color
				g.noticeDiscUpdated(d)
			}

			g.updateTurn()
		} else {
			disc.Color = DiscTransparent
		}
	}
}

func (g *Game) updateTurn() {

	if g.GameOvered {
		return
	}

	if g.PassContinuous > 2 {
		g.noticeGameOver(nil)
	}

	switch g.TurnColor {
	case "":
		g.TurnColor = DiscBlack
	case DiscBlack:
		g.TurnColor = DiscWhite
	case DiscWhite:
		g.TurnColor = DiscBlack
	}

	for _, player := range g.Players {
		player.Send(&network.Context{
			Type:      network.TurnUpdate,
			TurnColor: g.TurnColor,
		})
	}

	if !g.canPlaceDisc() {
		g.updateTurn()
		g.PassContinuous++
	} else {
		g.PassContinuous = 0
	}
}

func (g *Game) noticeDiscPlaced(disc *Disc) {

	if g.GameOvered {
		return
	}

	for _, player := range g.Players {
		player.Send(&network.Context{
			Type:      network.DiscPlaced,
			DiscX:     disc.X,
			DiscY:     disc.Y,
			DiscColor: disc.Color,
		})
	}
}

func (g *Game) noticeDiscUpdated(disc *Disc) {

	if g.GameOvered {
		return
	}

	for _, player := range g.Players {
		player.Send(&network.Context{
			Type:      network.DiscUpdated,
			DiscX:     disc.X,
			DiscY:     disc.Y,
			DiscColor: disc.Color,
		})
	}
}

func (g *Game) noticeGameOver(winner *Player) {
	white, black := 0, 0

	for _, line := range g.Board {
		for _, disc := range line {
			switch disc.Color {
			case DiscBlack:
				black++
			case DiscWhite:
				white++
			}
		}
	}

	if winner == nil {
		var winnerColor string
		if white == black {
			winnerColor = DiscTransparent
		} else if white > black {
			winnerColor = DiscWhite
		} else {
			winnerColor = DiscBlack
		}
		for _, p := range g.Players {
			if p.Color == winnerColor {
				winner = p
				break
			}
		}
	}

	for _, p := range g.Players {
		p.Send(&network.Context{
			Type: network.GameOver,
			Result: network.GameResult{
				ID:     g.id,
				Black:  black,
				White:  white,
				Winner: winner.Name,
			},
		})
	}

	g.GameOvered = true
	g.manager.Remove(g.id)
}

func (g *Game) canPlaceDisc() bool {

	transparent, countCanPlace := 0, 0

	for y, line := range g.Board {
		for x, disc := range line {
			if disc.Color == DiscTransparent {
				transparent++

				ghost := &Disc{
					X:     x,
					Y:     y,
					Color: g.TurnColor,
				}

				betweens := g.findBetweenDiscs(ghost)

				if len(betweens) > 0 {
					countCanPlace++
				}
			}
		}
	}

	if transparent == 0 {
		g.noticeGameOver(nil)
		return false
	}

	if countCanPlace == 0 {
		return false
	}

	return true
}

func (g *Game) findBetweenDiscs(start *Disc) []*Disc {
	inBetweens := make([]*Disc, 0, 64)
	inBetweens = append(inBetweens, g.findByLine(1, 0, start)...)
	inBetweens = append(inBetweens, g.findByLine(-1, 0, start)...)
	inBetweens = append(inBetweens, g.findByLine(0, 1, start)...)
	inBetweens = append(inBetweens, g.findByLine(0, -1, start)...)
	inBetweens = append(inBetweens, g.findByLine(1, -1, start)...)
	inBetweens = append(inBetweens, g.findByLine(-1, 1, start)...)
	inBetweens = append(inBetweens, g.findByLine(1, 1, start)...)
	inBetweens = append(inBetweens, g.findByLine(-1, -1, start)...)

	return inBetweens
}

func (g *Game) findByLine(tox, toy int, disc *Disc) []*Disc {
	x, y := disc.X, disc.Y

	inBetweens := make([]*Disc, 0, 8)

	for {
		x, y = x+tox, y+toy

		if x < 0 || x >= 8 {
			inBetweens = make([]*Disc, 0, 8)
			break
		}

		if y < 0 || y >= 8 {
			inBetweens = make([]*Disc, 0, 8)
			break
		}

		d := g.Board[y][x]

		if d.Color == DiscTransparent {
			inBetweens = make([]*Disc, 0, 8)
			break
		}

		if d.Color == disc.Color {
			break
		}
		inBetweens = append(inBetweens, d)

	}
	return inBetweens
}

func (g *Game) ID() int {
	return g.id
}

func (g *Game) GameOverByExit(player *Player) {
	for _, p := range g.Players {
		if p.ID != player.ID {
			g.noticeGameOver(p)
			break
		}
	}
}
