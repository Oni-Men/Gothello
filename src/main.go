package main

import (
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"

	"othello/game"
	"othello/generator"
)

var (
	clients  = make(map[*websocket.Conn]bool)
	upgrader = websocket.Upgrader{}
	tokens   = make(map[*game.Player]string)
	q        = game.NewQueue()
	manager  = game.NewManager()
)

func main() {
	fs := http.FileServer(http.Dir("../public"))

	http.Handle("/", fs)
	http.HandleFunc("/game", handleClients)

	go matching()

	log.Fatal(http.ListenAndServe(":80", nil))
}

func handleClients(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
	}
	defer ws.Close()

	clients[ws] = true

	var p *game.Player
	for {
		ctx := new(game.Context)
		err := ws.ReadJSON(ctx)

		if err != nil {
			if p != nil {
				game, ok := manager.Get(p.GameID)
				if ok {
					game.GameOverByExit(p)
				} else {
					q.Remove(p)
				}
			}
			log.Printf("err has occured in read json: %s", err)
			delete(clients, ws)
			break
		}

		//TODO validate token
		if ctx.Token == "" && ctx.Type != game.FindOpponent {
			log.Printf("invalid token received")
			continue
		}

		if p != nil && tokens[p] != ctx.Token {
			log.Printf("invalid token received")
			continue
		}

		switch ctx.Type {
		case game.FindOpponent:
			p = handleFindOpponent(ctx, p, ws)
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
		for q.Length() >= 2 {
			a, b := q.Pop(), q.Pop()
			a.Color, b.Color = game.DiscWhite, game.DiscBlack

			ctx := &game.Context{
				Type:        game.GameInfo,
				BlackPlayer: *a,
				WhitePlayer: *b,
			}

			a.Send(ctx)
			b.Send(ctx)

			game := game.New(a, b, manager)
			manager.Add(game)
			a.GameID = game.ID()
			b.GameID = game.ID()
		}
	}
}

func handleFindOpponent(ctx *game.Context, p *game.Player, ws *websocket.Conn) *game.Player {
	if ctx.Nickname == "" && p != nil {
		q.Remove(p)
	} else {
		p = game.NewPlayer(ctx.Nickname, ws)
		q.Push(p)

		token := generator.Token(16)
		tokens[p] = token

		p.Send(&game.Context{
			Type:     game.Authentication,
			PlayerID: p.ID,
			Token:    token,
		})
	}

	return p
}

func handleClickBoard(ctx *game.Context, p *game.Player) {
	game, ok := manager.Get(p.GameID)
	if ok && game.IsTurnPlayer(p) {
		game.ClickBoard(ctx.DiscX, ctx.DiscY)
	}
}
