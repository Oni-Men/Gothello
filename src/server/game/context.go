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
	BlackPlayer Player      `json:"blackPlayer"`
	WhitePlayer Player      `json:"whitePlayer"`
	TurnColor   Disc        `json:"turnColor"`
	DiscColor   string      `json:"discColor"`
	DiscX       int         `json:"discX"`
	DiscY       int         `json:"discY"`
	Board       [8][8]Disc  `json:"board"` //ボードの状態を配信するため
	Nickname    *string     `json:"nickName"`
	GameID      int         `json:"gameId"` //観戦するときに利用する
	Result      GameResult  `json:"result"`
	Token       string      `json:"token"`
	PlayerID    int         `json:"playerId"`
}

//GameResult ゲームの結果を表します
type GameResult struct {
	ID     int
	Black  int
	White  int
	Winner string
}
