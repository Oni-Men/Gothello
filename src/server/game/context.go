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
	Type        ContextType
	BlackPlayer Player
	WhitePlayer Player
	TurnColor   Disc
	DiscColor   string
	DiscX       int
	DiscY       int
	Board       [8][8]Disc //ボードの状態を配信するため
	Nickname    string
	GameID      int //観戦するときに利用する
	Result      GameResult
	Token       string
	PlayerID    int
}

//GameResult ゲームの結果を表します
type GameResult struct {
	ID     int
	Black  int
	White  int
	Winner string
}
