package terminal

import "testing"

func TestControlSequences(t *testing.T) {
	if got := ClearSequence(); got != "\x1b[H\x1b[J" {
		t.Fatalf("ClearSequence() = %q", got)
	}
	if got := TitleSequence("Demo"); got != "\x1b]0;Demo\x07" {
		t.Fatalf("TitleSequence() = %q", got)
	}
	if got := CursorToStartSequence() + EraseLineSequence() + ErasePreviousLinesSequence(2) + ErasePreviousLinesSequence(-1) + HideCursorSequence() + ShowCursorSequence(); got != "\r\x1b[2K\x1b[1A\x1b[2K\x1b[1A\x1b[2K\x1b[?25l\x1b[?25h" {
		t.Fatalf("combined sequences = %q", got)
	}
}

func TestSupportsTrueColor(t *testing.T) {
	if !SupportsTrueColor("truecolor") {
		t.Fatalf("expected truecolor to be supported")
	}
	if !SupportsTrueColor("24bit") {
		t.Fatalf("expected 24bit to be supported")
	}
	if SupportsTrueColor("256color") {
		t.Fatalf("expected 256color to be unsupported")
	}
}

func TestParseColor(t *testing.T) {
	if got := ParseColor([]int{1, 2, 3}, DefaultForegroundColor()); got != (Color{1, 2, 3}) {
		t.Fatalf("ParseColor() = %#v", got)
	}
	if got := ParseColor([]int{0, 0, 300}, DefaultBackgroundColor()); got != DefaultBackgroundColor() {
		t.Fatalf("ParseColor(invalid) = %#v", got)
	}
	if got := ParseColor([]int{1, 2}, DefaultForegroundColor()); got != DefaultForegroundColor() {
		t.Fatalf("ParseColor(short) = %#v", got)
	}
}
