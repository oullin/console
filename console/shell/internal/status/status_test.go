package status

import (
	"errors"
	"strings"
	"testing"

	"github.com/oullin/tui/internal/environment"
	textutil "github.com/oullin/tui/internal/strings"
)

func withStatusOutput(callback func(output *environment.MemoryOutput) error) error {
	output := environment.NewMemoryOutput()
	return environment.With(environment.Patch{Output: output, ErrorOutput: output}, func() error {
		return callback(output)
	})
}

func TestSpinnerFramesAndCleanup(t *testing.T) {
	if got := SpinnerFrame(3); got != "⠰" {
		t.Fatalf("SpinnerFrame() = %q", got)
	}
	if got := RenderSpinnerFrame("Working", 3); got != " ⠰ Working\n" {
		t.Fatalf("RenderSpinnerFrame() = %q", got)
	}

	err := withStatusOutput(func(output *environment.MemoryOutput) error {
		result, err := Spin("Working", func() (string, error) { return "done", nil })
		if err != nil {
			return err
		}
		if result != "done" {
			t.Fatalf("Spin() = %q", result)
		}
		rendered := output.Text()
		for _, want := range []string{"\x1b[?25l", " ⠶ Working", "\x1b[1A\x1b[2K", "\x1b[?25h"} {
			if !strings.Contains(rendered, want) {
				t.Fatalf("spinner output missing %q:\n%s", want, rendered)
			}
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
}

func TestProgressManualAndRunner(t *testing.T) {
	err := withStatusOutput(func(output *environment.MemoryOutput) error {
		bar := NewProgress(2, "Adding States", "")
		bar.Start()
		bar.Label("ALABAMA").Hint("alabama").Advance(1)
		if bar.Current() != 1 || !bar.Value() {
			t.Fatalf("progress current/value = %d/%v", bar.Current(), bar.Value())
		}
		bar.Finish()
		if !strings.Contains(output.Text(), "ALABAMA") || !strings.Contains(output.Text(), "1 / 2") || !strings.Contains(output.Text(), "\x1b[?25h") {
			t.Fatalf("progress output missing expected frame:\n%s", output.Text())
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}

	err = withStatusOutput(func(output *environment.MemoryOutput) error {
		result, err := RunProgress("Uppercasing States", []string{"Alabama", "Alaska"}, func(step string, bar *Progress) (string, error) {
			return strings.ToUpper(step), nil
		})
		if err != nil {
			return err
		}
		if strings.Join(result, ",") != "ALABAMA,ALASKA" {
			t.Fatalf("RunProgress() = %#v", result)
		}
		if !strings.Contains(output.Text(), "2 / 2") {
			t.Fatalf("progress runner output missing completion:\n%s", output.Text())
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
}

func TestStreamAppendsClosesAndRenders(t *testing.T) {
	err := withStatusOutput(func(output *environment.MemoryOutput) error {
		stream := NewStream()
		if err := stream.Append("hello"); err != nil {
			return err
		}
		if err := stream.Write(" world"); err != nil {
			return err
		}
		stream.Close()
		if stream.Value() != "hello world" || !stream.Closed() {
			t.Fatalf("stream value/closed = %q/%v", stream.Value(), stream.Closed())
		}
		if err := stream.Append(" later"); err == nil {
			t.Fatalf("expected append after close to fail")
		}
		if !strings.Contains(output.Text(), "\x1b[?25l") || !strings.Contains(output.Text(), "\x1b[?25h") || !strings.Contains(textutil.ParseAnsiText(output.Text()), " hello world") {
			t.Fatalf("stream output missing expected frame:\n%s", output.Text())
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
}

func TestTaskLoggerAndFrames(t *testing.T) {
	err := withStatusOutput(func(output *environment.MemoryOutput) error {
		result, err := Task("Running...", func(logger *Logger) (string, error) {
			logger.Log("line one")
			logger.Log("line two")
			logger.Log("line three")
			return "done", nil
		}, 2, false, "")
		if err != nil {
			return err
		}
		if result != "done" {
			t.Fatalf("Task() = %q", result)
		}
		rendered := output.Text()
		if strings.Contains(rendered, "line one") || !strings.Contains(rendered, "line two") || !strings.Contains(rendered, "line three") || !strings.Contains(rendered, "\x1b[?25h") {
			t.Fatalf("task output missing bounded logs:\n%s", rendered)
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}

	err = withStatusOutput(func(output *environment.MemoryOutput) error {
		_, err := Task("Running...", func(logger *Logger) (string, error) {
			logger.Success("created")
			logger.Warning("check this")
			logger.Error("failed optional step")
			return "done", nil
		}, 10, true, "")
		if err != nil {
			return err
		}
		rendered := output.Text()
		for _, want := range []string{" • Running...", "✔ created", "⚠ check this", "✘ failed optional step"} {
			if !strings.Contains(rendered, want) {
				t.Fatalf("task summary missing %q:\n%s", want, rendered)
			}
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
}

func TestTaskFailureRestoresCursor(t *testing.T) {
	failure := errors.New("failed")
	err := withStatusOutput(func(output *environment.MemoryOutput) error {
		_, err := Task("Running...", func(logger *Logger) (string, error) {
			logger.Line("before\x1b[1G\x1b[2Kafter")
			return "", failure
		}, 10, false, "")
		if !errors.Is(err, failure) {
			t.Fatalf("Task() error = %v", err)
		}
		if !strings.Contains(output.Text(), "beforeafter") || !strings.Contains(output.Text(), "\x1b[?25h") {
			t.Fatalf("failed task output missing cleanup/sanitized log:\n%s", output.Text())
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
}

func TestFrameLineCountingAndErasing(t *testing.T) {
	frame := RenderTaskFrame(TaskFrameOptions{Label: "Running...", Limit: 2, Lines: []string{"line one"}})
	if got := RenderedFrameLineCount(frame); got != 4 {
		t.Fatalf("RenderedFrameLineCount() = %d", got)
	}
	err := withStatusOutput(func(output *environment.MemoryOutput) error {
		EraseRenderedFrame(frame)
		if output.Text() != strings.Repeat("\x1b[1A\x1b[2K", 4) {
			t.Fatalf("EraseRenderedFrame() output = %q", output.Text())
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
}
