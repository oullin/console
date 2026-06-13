package theme

import (
	stdstrings "strings"
	"testing"
)

func TestStyles(t *testing.T) {
	if got := Red("Error"); got != "\x1b[31mError\x1b[39m" {
		t.Fatalf("Red() = %q", got)
	}
	if got := Dim(""); got != "" {
		t.Fatalf("Dim(empty) = %q", got)
	}
	if got := ForegroundRGB("Text", 1, 2, 3); got != "\x1b[38;2;1;2;3mText\x1b[0m" {
		t.Fatalf("ForegroundRGB() = %q", got)
	}
}

func TestRenderQuestionAndError(t *testing.T) {
	if got := RenderQuestion("Name?", "required"); got != "? Name? required " {
		t.Fatalf("RenderQuestion() = %q", got)
	}
	if got := RenderError("Required"); got != "\x1b[31m! Required\x1b[39m\n" {
		t.Fatalf("RenderError() = %q", got)
	}
}

func TestRenderTable(t *testing.T) {
	result := RenderTable([]string{"Name", "Role"}, [][]string{{"Ada", "Admin"}, {"Linus", "User"}})

	for _, want := range []string{"┌───────┬───────┐", "\x1b[2mName\x1b[22m", "Ada", "Linus", "└───────┴───────┘"} {
		if !stdstrings.Contains(result, want) {
			t.Fatalf("RenderTable() missing %q in:\n%s", want, result)
		}
	}
}

func TestRenderBox(t *testing.T) {
	result := RenderBox(BoxOptions{Body: "Ready", Title: "Task", Width: 10})

	for _, want := range []string{" ┌ Task ──────┐", " │ Ready      │", " └────────────┘"} {
		if !stdstrings.Contains(result, want) {
			t.Fatalf("RenderBox() missing %q in:\n%s", want, result)
		}
	}
}
