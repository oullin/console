package tui_test

import (
	"strings"
	"testing"

	tui "github.com/oullin/tui"
)

func TestPublicAPIConsumesFormAndOutput(t *testing.T) {
	memoryOutput := tui.NewMemoryOutput()
	interactive := true
	err := tui.WithEnvironment(tui.Patch{
		Input:       tui.NewScriptedInput([]string{"A", "d", "a", tui.KeyFirst(tui.KeyEnter)}),
		Output:      memoryOutput,
		ErrorOutput: memoryOutput,
		Interactive: &interactive,
	}, func() error {
		responses, err := tui.Form().
			Text(tui.TextOptions{Message: "Name"}).
			Info("Saved", "note").
			Submit()
		if err != nil {
			return err
		}
		if responses.At(0) != "Ada" || responses.Named("note") != nil {
			t.Fatalf("responses positional=%#v named=%#v", responses.Values(), responses.Names())
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}

	if !strings.Contains(memoryOutput.Text(), "Saved") {
		t.Fatalf("output missing note: %q", memoryOutput.Text())
	}
}

func TestPublicAPIExportsCoreHelpers(t *testing.T) {
	if tui.KeyFromEvent(tui.KeyEvent{Name: "u", Ctrl: true}) != tui.KeyFirst(tui.KeyCtrlU) {
		t.Fatalf("ctrl-u key mapping mismatch")
	}
	if tui.VisibleWidth("\x1b[31mTokyo\x1b[39m") != 5 {
		t.Fatalf("visible width mismatch")
	}
	if tui.ClearTerminalSequence() == "" || tui.HideCursorSequence() == "" {
		t.Fatalf("terminal sequences should be exported")
	}
}
