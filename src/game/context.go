package game

//ContextType コンテキストのタイプ
type ContextType int

//通信の内容を表すのに使う
const (
	FindOpponent ContextType = iota
	OpponentFound
	TurnUpdate
	BoardUpdate
	GameOver
	ClickBoard
)

//Context 通信するデータ
type Context struct {
	Type          ContextType
	MyName        string
	OpponentName  string
	MyColor       Disc
	OpponentColor Disc
	TurnColor     Disc
	DiscColor     string
	DiscX         int
	DiscY         int
	Board         [8][8]Disc
	Result        GameResult
}

//GameResult ゲームの結果を表します
type GameResult struct {
	ID     int
	Black  int
	White  int
	Winner string
}
