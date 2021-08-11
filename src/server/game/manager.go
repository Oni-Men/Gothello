package game

const (
	capacity = 256
)

//Manager ゲームのリストを管理する
type Manager struct {
	list []*Entry
}

type Entry struct {
	game *Game
	next *Entry
}

func NewManager() *Manager {
	r := &Manager{
		list: make([]*Entry, capacity),
	}
	return r
}

func (m *Manager) Add(g *Game) {
	i := g.ID() % capacity
	e := &Entry{
		game: g,
	}

	if m.list[i] == nil {
		m.list[i] = e
	} else {

		//線形リストの最後尾まで辿る
		t := m.list[i]

		for t.next != nil {
			t = t.next
		}

		//最後尾に要素を追加する
		t.next = e
	}
}

func (m *Manager) Get(id int) (*Game, bool) {
	i := id % capacity
	e := m.list[i]

	for e != nil {

		if e.game.ID() == id {
			return e.game, true
		}

		e = e.next
	}

	return nil, false
}

func (m *Manager) Remove(id int) (*Game, bool) {
	i := id % capacity
	e := m.list[i]

	var prev *Entry

	for e != nil {

		if e.game.ID() == id {

			if prev != nil {
				prev.next = e.next
			}

			return e.game, true
		}

		prev = e
		e = e.next
	}

	return nil, false
}
