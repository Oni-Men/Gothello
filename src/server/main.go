package main

import (
	"flag"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/websocket"

	"othello/game"
	"othello/generator"
)

var (
	upgrader = websocket.Upgrader{
		// CheckOrigin: func(r *http.Request) bool {
		// 	return true
		// },
	}
	tokens  = make(map[*game.Player]string)
	q       = game.NewQueue()
	manager = game.NewManager()
)

func main() {
	port := flag.Int("port", 80, "Server port")
	flag.Parse()

	fs := http.FileServer(http.Dir("./public"))

	http.Handle("/", fs)
	http.HandleFunc("/game", handleClients)

	go matching()

	addr := ":" + strconv.Itoa(*port)

	log.Printf("Done. Listening on port %d\n", *port)
	log.Fatal(http.ListenAndServe(addr, nil))
}

func handleClients(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
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
		err := ws.ReadJSON(ctx)

		if err != nil {
			game, ok := manager.Get(p.GameID)
			if ok {
				game.GameOverByExit(p)
			} else {
				q.Remove(p)
			}
			log.Printf("%s: %s", p.Name, err)
			break
		}

		if tokens[p] != ctx.Token {
			log.Printf("無効なトークンを受け取りました: %s", p.Name)
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

func matching() {
	for {
		time.Sleep(1 * time.Second)
		if q.Length() >= 2 {
			a, b := q.Pop(), q.Pop()

			if a.ConnectionEquals(b) || tokens[a] == tokens[b] {
				q.Push(a)
				continue
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
	}
}

func handlePlayerInit(ws *websocket.Conn) *game.Player {
	ctx := new(game.Context)
	err := ws.ReadJSON(ctx)

	if err != nil {
		sendError(ws, err.Error())
		return nil
	}

	if ctx.Type != game.Authentication {
		sendError(ws, "context type must be authentication")
		return nil
	}

	if ctx.Nickname == nil {
		sendError(ws, "you must specifiy the nickname")
		return nil
	}

	if len(*ctx.Nickname) < 3 {
		sendError(ws, "the length of nickname is less than 3")
		return nil
	}

	p := game.NewPlayer(*ctx.Nickname, ws)

	token := generator.Token(16)
	tokens[p] = token

	p.Send(&game.Context{
		Type:     game.Authentication,
		PlayerID: p.ID,
		Token:    token,
	})

	return p
}

func handleFindOpponent(ctx *game.Context, p *game.Player) {
	if ctx.Flag {
		err := q.Push(p)

		if err != nil {
			log.Printf("キューへの追加に失敗しました: %s, %s", p.Name, err.Error())
			sendError(p.Conn, err.Error())
		}

		log.Printf("キューに追加しました: %s", p.Name)
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
