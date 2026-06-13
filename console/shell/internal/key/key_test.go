package key

import "testing"

func TestFromEventMapsNamedKeys(t *testing.T) {
	if got := FromEvent(Event{Name: "enter"}); got != First(Enter) {
		t.Fatalf("FromEvent() = %q, want %q", got, First(Enter))
	}
}

func TestFromEventMapsAliases(t *testing.T) {
	tests := []struct {
		name string
		want string
	}{
		{name: "return", want: First(Enter)},
		{name: "pageup", want: First(PageUp)},
		{name: "pagedown", want: First(PageDown)},
	}

	for _, test := range tests {
		if got := FromEvent(Event{Name: test.name}); got != test.want {
			t.Fatalf("FromEvent(%q) = %q, want %q", test.name, got, test.want)
		}
	}
}

func TestFromEventMapsSequencesAndModifiers(t *testing.T) {
	tests := []struct {
		event Event
		want  string
	}{
		{event: Event{Sequence: " "}, want: First(Space)},
		{event: Event{Sequence: "\n"}, want: First(Enter)},
		{event: Event{Ctrl: true, Name: "c"}, want: First(CtrlC)},
		{event: Event{Ctrl: true, Name: "n"}, want: First(CtrlN)},
		{event: Event{Ctrl: true, Name: "U"}, want: First(CtrlU)},
		{event: Event{Meta: true, Name: "backspace"}, want: First(OptionBackspace)},
		{event: Event{Shift: true, Name: "tab"}, want: First(ShiftTab)},
	}

	for _, test := range tests {
		if got := FromEvent(test.event); got != test.want {
			t.Fatalf("FromEvent(%+v) = %q, want %q", test.event, got, test.want)
		}
	}
}

func TestOneOfMatchesGroupedKeys(t *testing.T) {
	if got, ok := OneOf([]Value{Home, End}, Home[2]); !ok || got != Home[2] {
		t.Fatalf("OneOf(Home[2]) = %q, %v", got, ok)
	}

	if got, ok := OneOf([]Value{Home, End}, End[3]); !ok || got != End[3] {
		t.Fatalf("OneOf(End[3]) = %q, %v", got, ok)
	}

	if _, ok := OneOf([]Value{Home, End}, First(Enter)); ok {
		t.Fatalf("OneOf(Enter) matched unexpectedly")
	}
}
