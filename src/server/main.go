package main

import (
	"flag"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/websocket"

	"othello/game"
	"othello/generator"
)

var (
	upgrader = websocket.Upgrader{}
	tokens   = make(map[*game.Player]string)
	q        = game.NewQueue()
	manager  = game.NewManager()
)

func main() {
	port := flag.Int("port", 80, "Server port")
	flag.Parse()

	fs := http.FileServer(http.Dir("./public"))

	http.Handle("/", fs)
	http.HandleFunc("/game", handleClient)

	addr := ":" + strconv.Itoa(*port)

	log.Printf("Done. Listening on port %d\n", *port)
	log.Fatal(http.ListenAndServe(addr, nil))
}

func handleClient(writer http.ResponseWriter, req *http.Request) {
	ws, err := upgrader.Upgrade(writer, req, nil)
	if err != nil {
		log.Fatal(err)
	}

	defer ws.Close()

	p := handlePlayerInit(ws)
	if p == nil {
		return
	}

	for {
		ctx := new(game.Context)

		if err := ws.ReadJSON(ctx); err != nil {
			game, ok := manager.Get(p.GameID)
			if ok {
				game.GameOverByExit(p)
				log.Printf("退出によりゲーム終了: %s (%s)", p.Name, err)
			} else {
				q.Remove(p)
				log.Printf("キューから削除: %s (%s)", p.Name, err)
			}
			break
		}

		token, ok := tokens[p]
		if !ok || token != ctx.Token {
			log.Printf("無効なトークンです: %s", p.Name)
			sendError(p.Conn, "invalid token")
		}

		switch ctx.Type {
		case game.FindOpponent:
			handleFindOpponent(ctx, p)
		case game.ClickBoard:
			handleClickBoard(ctx, p)
		case game.Spectate:
			//TODO impl handle spectate
		}

	}
}

func tryMatching() {
	if q.Length() < 2 {
		return
	}

	a, b := q.Pop(), q.Pop()

	if a.ConnectionEquals(b) || tokens[a] == tokens[b] {
		q.Push(a)
		return
	}

	a.Color, b.Color = game.DiscBlack, game.DiscWhite
	g := game.New(a, b, manager)
	manager.Add(g)

	a.GameID = g.ID()
	b.GameID = g.ID()

	ctx := &game.Context{
		Type:        game.GameInfo,
		BlackPlayer: g.BlackPlayer,
		WhitePlayer: g.WhitePlayer,
		GameID:      g.ID(),
		TurnColor:   g.TurnColor,
		Board:       &g.Board,
	}

	a.Send(ctx)
	b.Send(ctx)
}

func handlePlayerInit(ws *websocket.Conn) *game.Player {
	ctx := new(game.Context)
	if err := ws.ReadJSON(ctx); err != nil {
		sendError(ws, err.Error())
		return nil
	}

	if ctx.Type != game.Authentication {
		sendError(ws, "context type must be authentication")
		return nil
	}

	if ctx.Nickname == nil {
		sendError(ws, "the nickname must not be empty")
		return nil
	}

	if len(*ctx.Nickname) < 3 {
		sendError(ws, "the length of the nickname must be at least 3")
		return nil
	}

	p := game.NewPlayer(*ctx.Nickname, ws)

	token := generator.Token(16)
	tokens[p] = token
	p.SendToken(token)

	return p
}

func handleFindOpponent(ctx *game.Context, p *game.Player) {
	if ctx.Flag {
		if err := q.Push(p); err != nil {
			log.Printf("キューへの追加に失敗: %s (%s)", p.Name, err.Error())
			sendError(p.Conn, err.Error())
		} else {
			log.Printf("キューへの追加に成功: %s", p.Name)
			tryMatching()
		}

	} else {
		q.Remove(p)
		log.Printf("キューから削除しました: %s", p.Name)
	}
}

func handleClickBoard(ctx *game.Context, p *game.Player) {
	game, ok := manager.Get(p.GameID)
	if ok && game.IsTurnPlayer(p) {
		game.ClickBoard(ctx.DiscX, ctx.DiscY)
	}
}

func sendError(ws *websocket.Conn, err string) {
	ws.WriteJSON(game.Context{
		Type:  game.Fail,
		Error: err,
	})
}
