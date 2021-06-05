package game

import (
	"github.com/gorilla/websocket"

	"othello/network"
)

//Player オセロのプレイヤーを管理します
type Player struct {
	ID     int
	GameID int
	Conn   *websocket.Conn
	Name   string
	Color  string
	Turn   bool
}

func NewPlayer(name string, ws *websocket.Conn) *Player {
	p := &Player{
		ID:    RandomID(),
		Color: DiscTransparent,
		Name:  name,
		Conn:  ws,
		Turn:  false,
	}
	return p
}

func (p *Player) Send(ctx *network.Context) {
	if p.Conn != nil {
		p.Conn.WriteJSON(ctx)
	}
}
