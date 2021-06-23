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
	upgrader = websocket.Upgrader{
		//TODO Delete this after finish front-end
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}
	tokens  = make(map[*game.Player]string)
	q       = game.NewQueue()
	manager = game.NewManager()
)

func main() {
	fs := http.FileServer(http.Dir("../../public"))

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
				log.Printf("%s disconnected", p.Name)
				log.Printf("%s", err)
			} else {
				log.Printf("error at reading json: %s", err)
			}
			delete(clients, ws)
			break
		}

		if ctx.Type != game.FindOpponent {
			if ctx.Token == "" || (p != nil && tokens[p] != ctx.Token) {
				log.Printf("invalid token received")
			}
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

			// If connection was the same. won't start a game and put the player back in the queue.
			if a.ConnectionEquals(b) {
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

func handleFindOpponent(ctx *game.Context, p *game.Player, ws *websocket.Conn) *game.Player {
	if ctx.Nickname == nil && p != nil {
		q.Remove(p)
		log.Printf("%s quit the queue", p.Name)
	} else {
		p = game.NewPlayer(*ctx.Nickname, ws)
		q.Push(p)
		log.Printf("%s join the queue", p.Name)

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
