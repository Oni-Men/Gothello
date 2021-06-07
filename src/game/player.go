package game

import (
	"othello/generator"

	"github.com/gorilla/websocket"
)

//Player オセロのプレイヤーを管理します
type Player struct {
	ID     int
	GameID int
	Conn   *websocket.Conn
	Name   string
	Color  Disc
	Turn   bool
}

func NewPlayer(name string, ws *websocket.Conn) *Player {
	p := &Player{
		ID:    generator.RandomID(),
		Color: DiscTransparent,
		Name:  name,
		Conn:  ws,
		Turn:  false,
	}
	return p
}

func (p *Player) Send(ctx *Context) {
	if p == nil {
		return
	}
	if p.Conn != nil {
		p.Conn.WriteJSON(ctx)
	}
}
