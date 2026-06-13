package output

import (
	"reflect"
	"strings"
	"testing"

	"github.com/oullin/tui/internal/environment"
	"github.com/oullin/tui/internal/key"
	textutil "github.com/oullin/tui/internal/strings"
)

func withOutput(callback func(output *environment.MemoryOutput) error) error {
	output := environment.NewMemoryOutput()
	return environment.With(environment.Patch{Output: output, ErrorOutput: output}, func() error {
		return callback(output)
	})
}

func TestNoteHelpersRenderStyledLines(t *testing.T) {
	err := withOutput(func(output *environment.MemoryOutput) error {
		Note("Hello\nWorld", "")
		Warning("Careful")
		Error("Nope")
		Alert("Heads up")
		Info("Facts")
		Intro("東京\nA")
		Outro("Done")

		rendered := output.Text()
		if !strings.Contains(rendered, "Hello") || !strings.Contains(rendered, "\x1b[33m Careful\x1b[39m") || !strings.Contains(rendered, "\x1b[31m Nope\x1b[39m") {
			t.Fatalf("note output missing styled lines:\n%s", rendered)
		}
		if !strings.Contains(textutil.ParseAnsiText(rendered), "  東京 ") || !strings.Contains(textutil.ParseAnsiText(rendered), "  A    ") {
			t.Fatalf("intro output missing visible-width padding:\n%s", rendered)
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
}

func TestTableGridAndTerminalHelpers(t *testing.T) {
	err := withOutput(func(output *environment.MemoryOutput) error {
		Table([]string{"Name", "Runtime"}, [][]any{{"Ollin", "OpenTUI"}})
		Grid([]any{"A", "B"}, 80)
		Title("Prompt")
		Clear()

		rendered := output.Text()
		for _, want := range []string{"Name", "Runtime", "Ollin", "OpenTUI", "┌───┬───┐", "│ A │ B │", "\x1b]0;Prompt\x07", "\x1b[H\x1b[J"} {
			if !strings.Contains(rendered, want) {
				t.Fatalf("output missing %q:\n%s", want, rendered)
			}
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
}

func TestRenderGridBalancedRows(t *testing.T) {
	got := RenderGrid([]any{"component-alpha", "api-client", "theme-box", "status-task", "prompt-input", "stream-log"}, 50)
	want := strings.Join([]string{
		" ┌─────────────────┬─────────────┐",
		" │ component-alpha │ api-client  │",
		" ├─────────────────┼─────────────┤",
		" │ theme-box       │ status-task │",
		" ├─────────────────┼─────────────┤",
		" │ prompt-input    │ stream-log  │",
		" └─────────────────┴─────────────┘",
	}, "\n")
	if got != want {
		t.Fatalf("RenderGrid() =\n%s\nwant\n%s", got, want)
	}
}

func TestNotificationCommandsAndFallback(t *testing.T) {
	command := NotificationCommandFor("darwin", "Deploy", "Done", "Preview", "Glass", "")
	if command == nil || command.Bin != "osascript" || !strings.Contains(command.Args[1], `display notification "Done"`) || !strings.Contains(command.Args[1], `sound name "Glass"`) {
		t.Fatalf("darwin command = %#v", command)
	}

	commands := NotificationCommands("linux", "Deploy", "Done", "", "", "/tmp/icon.png")
	wantFirst := NotificationCommand{Bin: "notify-send", Args: []string{"--icon", "/tmp/icon.png", "Deploy", "Done"}}
	if !reflect.DeepEqual(commands[0], wantFirst) {
		t.Fatalf("linux command = %#v, want %#v", commands[0], wantFirst)
	}

	executed := []NotificationCommand{}
	ok := NotifyForPlatform("linux", "Deploy", "Done", "", "", "", NotificationRuntime{
		CommandExists: func(bin string) bool { return bin == "kdialog" },
		Execute: func(command NotificationCommand) bool {
			executed = append(executed, command)
			return true
		},
	})
	if !ok || len(executed) != 1 || executed[0].Bin != "kdialog" {
		t.Fatalf("NotifyForPlatform linux ok=%v executed=%#v", ok, executed)
	}

	err := withOutput(func(output *environment.MemoryOutput) error {
		if NotifyForPlatform("freebsd", "Deploy", "Done", "", "", "", NotificationRuntime{}) {
			t.Fatalf("unsupported notification returned true")
		}
		if !strings.Contains(output.Text(), "Deploy: Done") {
			t.Fatalf("fallback note missing:\n%s", output.Text())
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
}

func TestDataTableSelectsFiltersAndCancels(t *testing.T) {
	rows := []DataTableRow{
		{Cells: map[string]any{"Name": "Alpha", "Runtime": "Node"}, Value: "alpha"},
		{Cells: map[string]any{"Name": "Beta", "Runtime": "OpenTUI"}, Value: "beta"},
	}
	err := withDataTableEnvironment(environment.NewScriptedInput([]string{key.First(key.Down), key.First(key.Enter)}), func(output *environment.MemoryOutput) error {
		result, err := DataTable(DataTableOptions{Message: "Pick project", Headers: []string{"Name", "Runtime"}, Rows: rows})
		if err != nil {
			return err
		}
		if result != "beta" {
			t.Fatalf("DataTable() = %#v", result)
		}
		if !strings.Contains(output.Text(), "Pick project") || !strings.Contains(output.Text(), "›") || !strings.Contains(output.Text(), "Bob, Developer") && !strings.Contains(output.Text(), "Beta, OpenTUI") {
			t.Fatalf("datatable output missing expected frame/summary:\n%s", output.Text())
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}

	err = withDataTableEnvironment(environment.NewScriptedInput([]string{"/", "B", key.First(key.Enter)}), func(output *environment.MemoryOutput) error {
		result, err := DataTable(DataTableOptions{Message: "Pick project", Headers: []string{"Name", "Runtime"}, Rows: rows})
		if err != nil {
			return err
		}
		if result != "beta" {
			t.Fatalf("filtered DataTable() = %#v", result)
		}
		if !strings.Contains(output.Text(), "Pick project B") {
			t.Fatalf("datatable output missing search query:\n%s", output.Text())
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}

	err = withDataTableEnvironment(environment.NewScriptedInput([]string{key.First(key.Down), key.First(key.CtrlC)}), func(output *environment.MemoryOutput) error {
		result, err := DataTable(DataTableOptions{Message: "Pick project", Headers: []string{"Name", "Runtime"}, Rows: rows})
		if err != nil {
			return err
		}
		if result != "beta" || !strings.Contains(output.Text(), "Cancelled.") || !strings.Contains(output.Text(), "/ Search") {
			t.Fatalf("cancelled DataTable() = %#v output:\n%s", result, output.Text())
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
}

func withDataTableEnvironment(input environment.Input, callback func(output *environment.MemoryOutput) error) error {
	output := environment.NewMemoryOutput()
	interactive := true
	return environment.With(environment.Patch{Input: input, Output: output, ErrorOutput: output, Interactive: &interactive}, func() error {
		return callback(output)
	})
}
