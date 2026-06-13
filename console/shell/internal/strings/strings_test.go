package strings

import (
	"reflect"
	stdstrings "strings"
	"testing"
)

func TestVisibleWidthIgnoresANSI(t *testing.T) {
	if got := VisibleWidth("\x1b[31mPrompts\x1b[39m"); got != 7 {
		t.Fatalf("VisibleWidth() = %d, want 7", got)
	}
}

func TestTruncate(t *testing.T) {
	if got := Truncate("Ollin Prompts", 10); got != "Ollin P..." {
		t.Fatalf("Truncate() = %q", got)
	}
}

func TestTruncateClosesANSIStyles(t *testing.T) {
	result := Truncate("\x1b[31mOllin Prompts\x1b[39m", 10)

	if got := ParseAnsiText(result); got != "Ollin P..." {
		t.Fatalf("ParseAnsiText(truncated) = %q", got)
	}
	if !stdstrings.Contains(result, "\x1b[31m") {
		t.Fatalf("expected red ANSI open sequence in %q", result)
	}
	if !stdstrings.Contains(result, "\x1b[0m...") {
		t.Fatalf("expected reset before marker in %q", result)
	}
	if stdstrings.HasSuffix(result, "\x1b[39m") {
		t.Fatalf("did not expect foreground reset suffix in %q", result)
	}
}

func TestTruncateClipsMarkers(t *testing.T) {
	if got := Truncate("Ollin Prompts", 1, "…"); got != "…" {
		t.Fatalf("Truncate(marker) = %q", got)
	}
	if got := Truncate("Ollin Prompts", 1, "東京"); got != "" {
		t.Fatalf("Truncate(wide marker) = %q", got)
	}
}

func TestWrap(t *testing.T) {
	if got := Wrap("Ollin Prompts", 7); !reflect.DeepEqual(got, []string{"Ollin", "Prompts"}) {
		t.Fatalf("Wrap() = %#v", got)
	}

	if got := Wrap("😀", 1); !reflect.DeepEqual(got, []string{"😀"}) {
		t.Fatalf("Wrap(wide) = %#v", got)
	}
}

func TestParseAnsi(t *testing.T) {
	if got := ParseAnsiText("\x1b[32mDone\x1b[39m"); got != "Done" {
		t.Fatalf("ParseAnsiText() = %q", got)
	}

	if got := ParseAnsiSegments("Hello, World!"); !reflect.DeepEqual(got, []AnsiSegment{{Text: "Hello, World!", Codes: ""}}) {
		t.Fatalf("ParseAnsiSegments(plain) = %#v", got)
	}

	want := []AnsiSegment{{Text: "Hello ", Codes: ""}, {Text: "Bold", Codes: "\x1b[1m"}, {Text: " World", Codes: ""}}
	if got := ParseAnsiSegments("Hello \x1b[1mBold\x1b[0m World"); !reflect.DeepEqual(got, want) {
		t.Fatalf("ParseAnsiSegments(styled) = %#v", got)
	}

	want = []AnsiSegment{{Text: "Colored", Codes: "\x1b[38;2;255;100;50m"}}
	if got := ParseAnsiSegments("\x1b[38;2;255;100;50mColored\x1b[0m"); !reflect.DeepEqual(got, want) {
		t.Fatalf("ParseAnsiSegments(rgb) = %#v", got)
	}
}

func TestWrapPreservesANSI(t *testing.T) {
	result := Wrap("\x1b[31mHello World\x1b[0m", 5)

	if len(result) != 2 {
		t.Fatalf("Wrap() len = %d, want 2: %#v", len(result), result)
	}
	for _, want := range []string{"Hello", "World"} {
		found := false
		for _, line := range result {
			found = found || stdstrings.Contains(line, want)
		}
		if !found {
			t.Fatalf("expected wrapped output to contain %q: %#v", want, result)
		}
	}
	for _, line := range result {
		if !stdstrings.Contains(line, "\x1b[31m") || !stdstrings.HasSuffix(line, "\x1b[0m") {
			t.Fatalf("wrapped line does not preserve ANSI: %q", line)
		}
	}
}
