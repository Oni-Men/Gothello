package main

import (
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"

	"othello/game"
)

var clients = make(map[*websocket.Conn]bool)
var upgrader = websocket.Upgrader{}

var q = game.NewQueue()
var manager = game.NewManager()

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

	var player *game.Player

	for {
		ctx := new(game.Context)
		err := ws.ReadJSON(ctx)

		if err != nil {
			if player != nil {
				game, ok := manager.Get(player.GameID)
				if ok {
					game.GameOverByExit(player)
				}
				q.Remove(player)
			}
			log.Printf("err has occured in read json: %s", err)
			delete(clients, ws)
			break
		}

		switch ctx.Type {
		case game.FindOpponent:
			if ctx.MyName == "" && player != nil {
				q.Remove(player)
			} else {
				player = game.NewPlayer(ctx.MyName, ws)
				q.Push(player)
			}
		case game.ClickBoard:
			game, ok := manager.Get(player.GameID)
			if ok && game.TurnColor == player.Color {
				game.ClickBoard(ctx.DiscX, ctx.DiscY, game.TurnColor)
			}
		}
	}
}

func matching() {
	for {
		time.Sleep(1 * time.Second)

		for q.Length() >= 2 {
			a, b := q.Pop(), q.Pop()
			a.Color, b.Color = game.DiscWhite, game.DiscBlack

			a.Send(&game.Context{
				Type:          game.OpponentFound,
				OpponentName:  b.Name,
				OpponentColor: b.Color,
				MyColor:       a.Color,
			})

			b.Send(&game.Context{
				Type:          game.OpponentFound,
				OpponentColor: a.Color,
				OpponentName:  a.Name,
				MyColor:       b.Color,
			})

			game := game.New(a, b, manager)
			manager.Add(game)
			a.GameID = game.ID()
			b.GameID = game.ID()
		}
	}
}
