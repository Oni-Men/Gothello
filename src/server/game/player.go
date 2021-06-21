package game

import (
	"othello/generator"

	"github.com/gorilla/websocket"
)

//Player オセロのプレイヤーを管理します
type Player struct {
	ID     int             `json:"id"`
	GameID int             `json:"gameId"`
	Conn   *websocket.Conn `json:"-"`
	Name   string          `json:"name"`
	Color  Disc            `json:"color"`
	Turn   bool            `json:"turn"`
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
