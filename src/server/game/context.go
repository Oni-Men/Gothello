package game

//ContextType コンテキストのタイプ
type ContextType int

//通信の内容を表すのに使う
const (
	FindOpponent ContextType = iota
	GameInfo
	TurnUpdate
	BoardUpdate
	GameOver
	ClickBoard
	Spectate
	Authentication
)

//Context 通信するデータ
type Context struct {
	Type        ContextType `json:"type"`
	BlackPlayer *Player     `json:"blackPlayer,omitempty"`
	WhitePlayer *Player     `json:"whitePlayer,omitempty"`
	TurnColor   Disc        `json:"turnColor"`
	DiscX       int         `json:"discX"`
	DiscY       int         `json:"discY"`
	Board       *[8][8]Disc `json:"board,omitempty"` //ボードの状態を配信するため
	Nickname    *string     `json:"nickname,omitempty"`
	GameID      int         `json:"gameId"`
	Result      *GameResult `json:"result,omitempty"`
	Token       string      `json:"token,omitempty"`
	PlayerID    int         `json:"playerId"`
}

//GameResult ゲームの結果を表します
type GameResult struct {
	ID     int    `json:"id"`
	Black  int    `json:"black"`
	White  int    `json:"white"`
	Winner string `json:"winner"`
}
