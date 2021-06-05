package network

//ContextType コンテキストのタイプ
type ContextType int

//通信の内容を表すのに使う
const (
	FindOpponent ContextType = iota
	OpponentFound
	TurnUpdate
	DiscPlaced
	DiscUpdated
	GameOver
	ClickBoard
)

//Context 通信するデータ
type Context struct {
	Type          ContextType
	OpponentColor string
	OpponentName  string
	MyName        string
	MyColor       string
	TurnColor     string
	DiscX         int
	DiscY         int
	DiscColor     string
	Result        GameResult
}

//GameResult ゲームの結果を表します
type GameResult struct {
	ID     int
	Black  int
	White  int
	Winner string
}
