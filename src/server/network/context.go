package network

import (
	"othello/disc"
	"othello/player"
)

//ContextType コンテキストのタイプ
type ContextType int

//通信の内容を表すのに使う
const (
	Fail ContextType = iota - 1
	Authentication
	FindOpponent
	GameInfo
	TurnUpdate
	BoardUpdate
	GameOver
	ClickBoard
	Spectate
)

//Context 通信するデータ
type Context struct {
	Type        ContextType      `json:"type"`
	Flag        bool             `json:"flag"`
	BlackPlayer *player.Player   `json:"blackPlayer,omitempty"`
	WhitePlayer *player.Player   `json:"whitePlayer,omitempty"`
	TurnColor   disc.Disc        `json:"turnColor"`
	DiscX       int              `json:"discX"`
	DiscY       int              `json:"discY"`
	Board       *[8][8]disc.Disc `json:"board,omitempty"` //ボードの状態を配信するため
	Nickname    *string          `json:"nickname,omitempty"`
	GameID      int              `json:"gameId"`
	Result      *GameResult      `json:"result,omitempty"`
	Token       string           `json:"token,omitempty"`
	PlayerID    int              `json:"playerId"`
	Error       string           `json:"error"`
}

//GameResult ゲームの結果を表します
type GameResult struct {
	ID     int    `json:"id"`
	Black  int    `json:"black"`
	White  int    `json:"white"`
	Winner string `json:"winner"`
}

func NewTokenContext(token string, id int) *Context {
	return &Context{
		Type:     Authentication,
		Token:    token,
		PlayerID: id,
	}
}

func (ctx *Context) Send(players ...*player.Player) {
	if ctx == nil {
		return
	}

	for _, p := range players {
		if p.Conn != nil {
			p.Conn.WriteJSON(ctx)
		}
	}
}
