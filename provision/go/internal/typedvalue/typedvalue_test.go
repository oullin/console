package typedvalue

import (
	"reflect"
	"testing"

	"github.com/oullin/tui/internal/key"
)

func apply(keys []string) string {
	state := State{}
	for _, pressed := range keys {
		next := ApplyKey(state, pressed, false)
		state = State{Cursor: next.Cursor, Value: next.Value}
	}

	return state.Value
}

func applyMultiline(keys []string) AppliedKey {
	state := State{}
	var next AppliedKey
	for _, pressed := range keys {
		next = ApplyKey(state, pressed, true)
		state = State{Cursor: next.Cursor, Value: next.Value}
	}

	return next
}

func applyMultilineState(value string, cursor int, keys []string, wrapWidth ...int) State {
	state := State{Cursor: cursor, Value: value}
	for _, pressed := range keys {
		next := ApplyKey(state, pressed, true, wrapWidth...)
		state = State{Cursor: next.Cursor, Value: next.Value}
	}

	return state
}

func TestTypedValueInsertionAndDeletion(t *testing.T) {
	if got := apply([]string{"Je", "ss"}); got != "Jess" {
		t.Fatalf("apply(insert) = %q", got)
	}

	if got := apply([]string{"J", "e", "z", key.First(key.Backspace), "s", "s"}); got != "Jess" {
		t.Fatalf("apply(backspace) = %q", got)
	}

	if got := apply([]string{"J", "e", "z", key.First(key.Left), key.First(key.Delete), "s", "s"}); got != "Jess" {
		t.Fatalf("apply(delete) = %q", got)
	}

	if got := apply([]string{"J", "e", "s", "s", key.First(key.Delete)}); got != "Jess" {
		t.Fatalf("apply(delete at end) = %q", got)
	}
}

func TestTypedValueMovementAndCancellation(t *testing.T) {
	if got := apply([]string{"J", "a", "n", "e", key.First(key.Left), key.First(key.Left), key.First(key.CtrlU), "D", "o"}); got != "Done" {
		t.Fatalf("apply(ctrl-u) = %q", got)
	}

	if got := apply([]string{"J", "z", "e", key.First(key.CtrlB), key.First(key.CtrlH), key.First(key.CtrlF), "s", "s"}); got != "Jess" {
		t.Fatalf("apply(emacs movement) = %q", got)
	}

	got := ApplyKey(State{Cursor: 3, Value: "Ada"}, key.First(key.CtrlC), false)
	want := AppliedKey{Cancelled: true, Cursor: 3, Submitted: false, Value: "Ada"}
	if got != want {
		t.Fatalf("ApplyKey(ctrl-c) = %#v, want %#v", got, want)
	}
}

func TestTypedValueUnicodeAndPreviousWordDeletion(t *testing.T) {
	if got := applyMultilineState("😀", len("😀"), []string{"!"}); got != (State{Cursor: 2, Value: "😀!"}) {
		t.Fatalf("unicode clamp = %#v", got)
	}

	if got := applyMultilineState("😀 hello", len([]rune("😀 hello")), []string{key.First(key.OptionBackspace)}); got != (State{Cursor: 2, Value: "😀 "}) {
		t.Fatalf("previous word after emoji = %#v", got)
	}

	if got := applyMultilineState("hello --", len([]rune("hello --")), []string{key.First(key.OptionBackspace)}); got != (State{Cursor: 6, Value: "hello "}) {
		t.Fatalf("previous punctuation group = %#v", got)
	}
}

func TestTypedValueLineMovement(t *testing.T) {
	if got := apply([]string{"A", "r", key.Home[0], "J", key.End[0], "c", "h", "e", "r"}); got != "JArcher" {
		t.Fatalf("home/end = %q", got)
	}

	if got := applyMultiline([]string{"A", key.First(key.Enter), "B", key.First(key.CtrlD)}); !got.Submitted || got.Value != "A\nB" {
		t.Fatalf("multiline submit = %#v", got)
	}

	tests := []struct {
		name string
		got  State
		want State
	}{
		{name: "up", got: applyMultilineState("abc\nde\nfghi", 6, []string{key.First(key.Up)}), want: State{Cursor: 2, Value: "abc\nde\nfghi"}},
		{name: "down", got: applyMultilineState("abc\nde\nfghi", 2, []string{key.First(key.Down)}), want: State{Cursor: 6, Value: "abc\nde\nfghi"}},
		{name: "down long", got: applyMultilineState("abc\nde\nfghi", 6, []string{key.First(key.Down)}), want: State{Cursor: 9, Value: "abc\nde\nfghi"}},
		{name: "ctrl-p", got: applyMultilineState("abc\nde\nfghi", 6, []string{key.First(key.CtrlP)}), want: State{Cursor: 2, Value: "abc\nde\nfghi"}},
		{name: "ctrl-n", got: applyMultilineState("abc\nde\nfghi", 2, []string{key.First(key.CtrlN)}), want: State{Cursor: 6, Value: "abc\nde\nfghi"}},
		{name: "wrapped up", got: applyMultilineState("abcdefghijkl", 7, []string{key.First(key.Up)}, 5), want: State{Cursor: 2, Value: "abcdefghijkl"}},
		{name: "wrapped down", got: applyMultilineState("abcdefghijkl", 2, []string{key.First(key.Down)}, 5), want: State{Cursor: 7, Value: "abcdefghijkl"}},
		{name: "wrapped up from end", got: applyMultilineState("abcdefghijkl", 11, []string{key.First(key.Up)}, 5), want: State{Cursor: 6, Value: "abcdefghijkl"}},
		{name: "home line", got: applyMultilineState("abc\nde\nfghi", 5, []string{key.Home[0]}), want: State{Cursor: 4, Value: "abc\nde\nfghi"}},
		{name: "end line", got: applyMultilineState("abc\nde\nfghi", 5, []string{key.End[0]}), want: State{Cursor: 6, Value: "abc\nde\nfghi"}},
		{name: "ctrl-u line", got: applyMultilineState("abc\nde\nfghi", 9, []string{key.First(key.CtrlU)}), want: State{Cursor: 7, Value: "abc\nde\nhi"}},
	}

	for _, test := range tests {
		if test.got != test.want {
			t.Fatalf("%s = %#v, want %#v", test.name, test.got, test.want)
		}
	}

	if got := applyMultilineState("abc\nde\nfghi", 9, []string{key.First(key.CtrlA), "X", key.First(key.CtrlE), "Y"}); got != (State{Cursor: 13, Value: "abc\nde\nXfghiY"}) {
		t.Fatalf("ctrl-a/ctrl-e edit = %#v", got)
	}
}

func TestVisibleLineWindow(t *testing.T) {
	got := VisibleLineWindowFor("A\nB\nC", 5, 2)
	want := VisibleLineWindow{Lines: []string{"B", "C"}, Start: 1, Total: 3}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("VisibleLineWindowFor() = %#v, want %#v", got, want)
	}

	got = VisibleLineWindowFor("abcdefghijkl", 12, 2, 5)
	want = VisibleLineWindow{Lines: []string{"fghij", "kl"}, Start: 1, Total: 3}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("VisibleLineWindowFor(wrapped) = %#v, want %#v", got, want)
	}
}
