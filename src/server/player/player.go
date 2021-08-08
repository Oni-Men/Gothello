package player

import (
	"othello/disc"
	"othello/generator"

	"github.com/gorilla/websocket"
)

//Player オセロのプレイヤーを管理します
type Player struct {
	ID     int             `json:"id"`
	GameID int             `json:"gameId"`
	Conn   *websocket.Conn `json:"-"`
	Name   string          `json:"name"`
	Color  disc.Disc       `json:"color"`
	Turn   bool            `json:"turn"`
}

func New(name string, ws *websocket.Conn) *Player {
	p := &Player{
		ID:    generator.RandomID(),
		Color: disc.None,
		Name:  name,
		Conn:  ws,
		Turn:  false,
	}
	return p
}

func (p *Player) ConnectionEquals(o *Player) bool {
	return p.Conn == o.Conn
}
