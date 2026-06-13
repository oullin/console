package prompts

import (
	"errors"
	"strings"
	"testing"

	"github.com/oullin/tui/internal/environment"
	"github.com/oullin/tui/internal/key"
	"github.com/oullin/tui/internal/prompt"
	textutil "github.com/oullin/tui/internal/strings"
)

type lineOnlyInput struct {
	asked string
	line  string
}

func (input *lineOnlyInput) ReadKey() (string, bool, error) {
	return "", false, environment.ErrKeyInputUnsupported
}

func (input *lineOnlyInput) ReadLine(message string) (string, error) {
	input.asked = message
	return input.line, nil
}

func withTestEnvironment(input environment.Input, callback func(output *environment.MemoryOutput) error) error {
	output := environment.NewMemoryOutput()
	interactive := true
	return environment.With(environment.Patch{Input: input, Output: output, ErrorOutput: output, Interactive: &interactive}, func() error {
		return callback(output)
	})
}

func TestTextPromptReadsAndRendersTypedValues(t *testing.T) {
	err := withTestEnvironment(environment.NewScriptedInput([]string{"A", "d", "a", key.First(key.Enter)}), func(output *environment.MemoryOutput) error {
		result, err := Text(TextOptions{Message: "Name"})
		if err != nil {
			return err
		}
		if result != "Ada" {
			t.Fatalf("Text() = %q", result)
		}
		if !strings.Contains(output.Text(), "\x1b[36mName\x1b[39m") || !strings.Contains(textutil.ParseAnsiText(output.Text()), "Ada") {
			t.Fatalf("text output missing rendered prompt/value:\n%s", output.Text())
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
}

func TestTextRetriesValidationAndRendersSubmittedOnce(t *testing.T) {
	err := withTestEnvironment(environment.NewScriptedInput([]string{"J", "e", "s", key.First(key.Enter), "s", key.First(key.Enter)}), func(output *environment.MemoryOutput) error {
		result, err := Text(TextOptions{
			Message: "Name",
			Validate: func(value string) (string, error) {
				if value != "Jess" {
					return "Invalid name.", nil
				}
				return "", nil
			},
		})
		if err != nil {
			return err
		}
		if result != "Jess" {
			t.Fatalf("Text() = %q", result)
		}
		if !strings.Contains(output.Text(), "Invalid name.") {
			t.Fatalf("output missing validation error:\n%s", output.Text())
		}
		if count := strings.Count(output.Text(), "┌ \x1b[2mName\x1b[22m"); count != 1 {
			t.Fatalf("submitted frame count = %d", count)
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
}

func TestTextNonInteractiveDefaultTransformAndValidation(t *testing.T) {
	output := environment.NewMemoryOutput()
	interactive := false
	err := environment.With(environment.Patch{Output: output, ErrorOutput: output, Interactive: &interactive}, func() error {
		result, err := Text(TextOptions{
			Message: "Name",
			Default: " Ada ",
			Transform: func(value string) (string, error) {
				return strings.TrimSpace(value), nil
			},
			Validate: func(value string) (string, error) {
				if value != "Ada" {
					return "Unexpected value.", nil
				}
				return "", nil
			},
		})
		if err != nil {
			return err
		}
		if result != "Ada" {
			t.Fatalf("Text() = %q", result)
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
}

func TestTextareaPromptAcceptsMultilineInput(t *testing.T) {
	err := withTestEnvironment(environment.NewScriptedInput([]string{"A", key.First(key.Enter), "B", key.First(key.CtrlD)}), func(output *environment.MemoryOutput) error {
		result, err := Textarea(TextOptions{Message: "Description"})
		if err != nil {
			return err
		}
		if result != "A\nB" {
			t.Fatalf("Textarea() = %q", result)
		}
		if !strings.Contains(output.Text(), "Ctrl+D to submit") || !strings.Contains(textutil.ParseAnsiText(output.Text()), "│ A") || !strings.Contains(textutil.ParseAnsiText(output.Text()), "│ B") {
			t.Fatalf("textarea output missing expected frame:\n%s", output.Text())
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
}

func TestPasswordPromptMasksValues(t *testing.T) {
	err := withTestEnvironment(environment.NewScriptedInput([]string{"s", "e", "c", "r", "e", "t", key.First(key.Enter)}), func(output *environment.MemoryOutput) error {
		result, err := Password(TextOptions{Message: "Password"})
		if err != nil {
			return err
		}
		if result != "secret" {
			t.Fatalf("Password() = %q", result)
		}
		if strings.Contains(output.Text(), "secret") || !strings.Contains(output.Text(), "••••••") {
			t.Fatalf("password output leaked value or missed mask:\n%s", output.Text())
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
}

func TestNumberPromptParsesRetriesAndSteps(t *testing.T) {
	err := withTestEnvironment(environment.NewScriptedInput([]string{"1", "2", "a", key.First(key.Enter), "4", "2", key.First(key.Enter)}), func(output *environment.MemoryOutput) error {
		result, err := Number(NumberOptions{Message: "Amount"})
		if err != nil {
			return err
		}
		if result != 42 {
			t.Fatalf("Number() = %#v", result)
		}
		if !strings.Contains(output.Text(), "Must be a number") {
			t.Fatalf("number output missing validation error:\n%s", output.Text())
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}

	err = withTestEnvironment(environment.NewScriptedInput([]string{key.First(key.Up), key.First(key.Up), key.First(key.Down), key.First(key.Enter)}), func(_ *environment.MemoryOutput) error {
		result, err := Number(NumberOptions{Message: "Count", Step: 2, HasStep: true})
		if err != nil {
			return err
		}
		if result != 1 {
			t.Fatalf("stepped Number() = %#v", result)
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
}

func TestPausePromptWaitsForEnterAndFallsBackToLineInput(t *testing.T) {
	err := withTestEnvironment(environment.NewScriptedInput([]string{"x", key.First(key.Enter)}), func(output *environment.MemoryOutput) error {
		result, err := Pause("Continue")
		if err != nil {
			return err
		}
		if !result {
			t.Fatalf("Pause() = false")
		}
		if !strings.Contains(output.Text(), "\x1b[36mContinue\x1b[39m") || !strings.HasSuffix(output.Text(), "\n") {
			t.Fatalf("pause output missing frame/newline:\n%s", output.Text())
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}

	input := &lineOnlyInput{}
	err = withTestEnvironment(input, func(_ *environment.MemoryOutput) error {
		result, err := Pause("Continue")
		if err != nil {
			return err
		}
		if !result || !strings.Contains(input.asked, "Continue") {
			t.Fatalf("line fallback result=%v asked=%q", result, input.asked)
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
}

func TestCancellationUsesCustomHandlerAfterRendering(t *testing.T) {
	environment.CancelUsing(func(string) (string, error) {
		return "Manual", nil
	})
	defer environment.CancelUsing(nil)

	err := withTestEnvironment(environment.NewScriptedInput([]string{key.First(key.CtrlC)}), func(output *environment.MemoryOutput) error {
		result, err := Text(TextOptions{Message: "Name"})
		if err != nil {
			return err
		}
		if result != "Manual" {
			t.Fatalf("Text(cancelled) = %q", result)
		}
		if !strings.Contains(output.Text(), "Cancelled.") {
			t.Fatalf("cancelled output missing message:\n%s", output.Text())
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
}

func TestPromptValidationHelpers(t *testing.T) {
	if got := prompt.RequiredMessage("", prompt.Required{Enabled: true}); got != "Required." {
		t.Fatalf("RequiredMessage(empty) = %q", got)
	}
	if got := prompt.RequiredMessage("", prompt.Required{Enabled: true, Message: "Choose something."}); got != "Choose something." {
		t.Fatalf("RequiredMessage(custom) = %q", got)
	}
	if got := prompt.RequiredMessage("value", prompt.Required{Enabled: true}); got != "" {
		t.Fatalf("RequiredMessage(value) = %q", got)
	}

	_, err := Text(TextOptions{Message: "Name", Required: prompt.Required{Enabled: true}})
	var validation environment.PromptValidationError
	if err != nil && !errors.As(err, &validation) {
		t.Fatalf("expected validation error, got %v", err)
	}
}
