package environment

import (
	"errors"
	"testing"
)

func TestWithRestoresPreviousEnvironmentWhenCallbackFails(t *testing.T) {
	output := NewMemoryOutput()
	errorOutput := NewMemoryOutput()
	previous := Current()
	interactive := false

	Configure(Patch{Output: output, ErrorOutput: errorOutput, Interactive: &interactive})

	scopedOutput := NewMemoryOutput()
	scopedInteractive := true
	err := With(Patch{Output: scopedOutput, Interactive: &scopedInteractive}, func() error {
		current := Current()
		if current.Output != scopedOutput {
			t.Fatalf("Current().Output was not scoped output")
		}
		if current.ErrorOutput != errorOutput {
			t.Fatalf("Current().ErrorOutput was not preserved")
		}
		if !current.Interactive {
			t.Fatalf("Current().Interactive = false, want true")
		}

		return errors.New("failed")
	})

	if err == nil || err.Error() != "failed" {
		t.Fatalf("With() error = %v", err)
	}

	current := Current()
	if current.Output != output {
		t.Fatalf("Current().Output was not restored")
	}
	if current.ErrorOutput != errorOutput {
		t.Fatalf("Current().ErrorOutput was not restored")
	}
	if current.Interactive {
		t.Fatalf("Current().Interactive = true, want false")
	}

	Configure(Patch{
		Input:       previous.Input,
		Output:      previous.Output,
		ErrorOutput: previous.ErrorOutput,
		Interactive: &previous.Interactive,
	})
}

func TestConfigureMergesPartialPromptConfiguration(t *testing.T) {
	previous := Current()
	output := NewMemoryOutput()
	errorOutput := NewMemoryOutput()
	interactive := false

	Configure(Patch{Output: output, ErrorOutput: errorOutput, Interactive: &interactive})

	nextOutput := NewMemoryOutput()
	Configure(Patch{Output: nextOutput})

	current := Current()
	if current.Output != nextOutput {
		t.Fatalf("Current().Output was not updated")
	}
	if current.ErrorOutput != errorOutput {
		t.Fatalf("Current().ErrorOutput was not preserved")
	}
	if current.Interactive {
		t.Fatalf("Current().Interactive = true, want false")
	}

	Configure(Patch{
		Input:       previous.Input,
		Output:      previous.Output,
		ErrorOutput: previous.ErrorOutput,
		Interactive: &previous.Interactive,
	})
}

func TestMemoryOutputCapturesAndClears(t *testing.T) {
	output := NewMemoryOutput()

	output.Write("first")
	output.Write(" second")

	if got := output.Text(); got != "first second" {
		t.Fatalf("Text() = %q", got)
	}

	output.Clear()

	if got := output.Text(); got != "" {
		t.Fatalf("Text() after Clear() = %q", got)
	}
}

func TestScriptedInputDrainsForKeysAndLines(t *testing.T) {
	input := NewScriptedInput([]string{"a", "line"})

	if got, ok, err := input.ReadKey(); err != nil || !ok || got != "a" {
		t.Fatalf("ReadKey() = %q, %v, %v", got, ok, err)
	}

	if got, err := input.ReadLine("Question"); err != nil || got != "line" {
		t.Fatalf("ReadLine() = %q, %v", got, err)
	}

	if got, ok, err := input.ReadKey(); err != nil || ok || got != "" {
		t.Fatalf("ReadKey(empty) = %q, %v, %v", got, ok, err)
	}

	if got, err := input.ReadLine("Question"); err != nil || got != "" {
		t.Fatalf("ReadLine(empty) = %q, %v", got, err)
	}
}
