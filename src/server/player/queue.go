package player

import (
	"errors"
	"log"
)

type Queue struct {
	length uint16
	first  *Element
	last   *Element
}

type Element struct {
	player *Player
	next   *Element
}

//Create new queue for players
func NewQueue() *Queue {
	return &Queue{
		length: 0,
		first:  nil,
		last:   nil,
	}
}

func (q *Queue) Push(player *Player) error {
	if q.length >= 65535 {
		return errors.New("queue is max")
	}

	e := &Element{
		player: player,
	}

	q.length++

	if q.first == nil {
		q.first = e
	} else if q.last == nil {
		q.last = e
		q.first.next = q.last
	} else {
		q.last.next = e
		q.last = e
	}

	return nil
}

func (q *Queue) Pop() *Player {
	q.length--

	if q.first != nil {
		r := q.first
		q.first = q.first.next
		return r.player
	} else if q.last != nil {
		r := q.last
		return r.player
	}

	return nil
}

func (q *Queue) Length() uint16 {
	return q.length
}

func (q *Queue) Remove(player *Player) *Player {
	var prev *Element
	curr := q.first

	for curr != nil {
		if curr.player.ID == player.ID {
			if prev != nil {
				prev.next = curr.next
			}
			q.length--
			log.Printf("%sを削除", curr.player.Name)
			return curr.player
		}

		prev = curr
		curr = curr.next
	}

	return nil
}
