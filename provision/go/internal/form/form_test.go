package form

import (
	"reflect"
	"strings"
	"testing"

	"github.com/oullin/tui/internal/environment"
	"github.com/oullin/tui/internal/key"
	"github.com/oullin/tui/internal/output"
	"github.com/oullin/tui/internal/prompts"
)

func withFormEnvironment(keys []string, callback func(*environment.MemoryOutput) error) error {
	memoryOutput := environment.NewMemoryOutput()
	interactive := true
	return environment.With(
		environment.Patch{
			Input:       environment.NewScriptedInput(keys),
			Output:      memoryOutput,
			ErrorOutput: memoryOutput,
			Interactive: &interactive,
		},
		func() error {
			return callback(memoryOutput)
		},
	)
}

func TestBuilderRunsChainedStepsAndReturnsPositionalResponses(t *testing.T) {
	err := withFormEnvironment([]string{"A", "d", "a", key.First(key.Enter), key.First(key.Enter), key.First(key.Enter)}, func(*environment.MemoryOutput) error {
		responses, err := New().
			Text(prompts.TextOptions{Message: "Name"}).
			Select(prompts.ChoiceOptions{Message: "Runtime", Choices: prompts.NewStringChoices("TS", "JS")}).
			Confirm(prompts.ConfirmOptions{Message: "Active"}).
			Submit()
		if err != nil {
			return err
		}

		if responses.At(0) != "Ada" || responses.At(1) != "TS" || responses.At(2) != true {
			t.Fatalf("responses = %#v", responses.Values())
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
}

func TestBuilderKeysNamedResponsesAndPassesPreviousAndName(t *testing.T) {
	err := withFormEnvironment([]string{"A", "d", "a", key.First(key.Enter)}, func(*environment.MemoryOutput) error {
		responses, err := New().
			Text(prompts.TextOptions{Message: "Name"}, "name").
			Add(func(values *Responses, previous any, name string) (any, error) {
				if previous == nil {
					previous = "new"
				}
				return name + ":" + previous.(string) + ":Hello " + values.Named("name").(string), nil
			}, "greeting").
			Submit()
		if err != nil {
			return err
		}

		if responses.Named("name") != "Ada" || responses.Named("greeting") != "greeting:new:Hello Ada" {
			t.Fatalf("named responses = %#v", responses.Names())
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
}

func TestBuilderStoresNilForSkippedConditionalSteps(t *testing.T) {
	err := withFormEnvironment([]string{"n"}, func(*environment.MemoryOutput) error {
		responses, err := New().
			Confirm(prompts.ConfirmOptions{Message: "Include details?", Default: false, HasDefault: true}, "include").
			AddIf(func(values *Responses) (bool, error) {
				return values.Named("include") == true, nil
			}, func(*Responses, any, string) (any, error) {
				return "details", nil
			}, "details").
			Submit()
		if err != nil {
			return err
		}

		if responses.Named("include") != false || responses.Named("details") != nil {
			t.Fatalf("named responses = %#v", responses.Names())
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
}

func TestBuilderRevertsToPreviousStepAndReusesPriorResponse(t *testing.T) {
	err := withFormEnvironment([]string{
		"A", key.First(key.Enter),
		"B", key.First(key.CtrlU),
		key.First(key.Backspace), "C", key.First(key.Enter),
		"D", key.First(key.Enter),
	}, func(*environment.MemoryOutput) error {
		responses, err := New().
			Text(prompts.TextOptions{Message: "First"}).
			Text(prompts.TextOptions{Message: "Second"}).
			Submit()
		if err != nil {
			return err
		}

		if responses.At(0) != "C" || responses.At(1) != "D" {
			t.Fatalf("responses = %#v", responses.Values())
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
}

func TestBuilderReusesPreviousPromptDefaultsByType(t *testing.T) {
	err := withFormEnvironment([]string{
		"4", key.First(key.Enter),
		key.First(key.Space), key.First(key.Enter),
		key.First(key.CtrlU),
		key.First(key.Enter),
		"D", key.First(key.Enter),
	}, func(*environment.MemoryOutput) error {
		responses, err := New().
			Number(prompts.NumberOptions{Message: "Count"}).
			Multiselect(prompts.MultiChoiceOptions{Message: "Flags", Choices: prompts.NewStringChoices("alpha", "beta")}).
			Text(prompts.TextOptions{Message: "Done"}).
			Submit()
		if err != nil {
			return err
		}

		if responses.At(0) != 4 || !reflect.DeepEqual(responses.At(1), []any{"alpha"}) || responses.At(2) != "D" {
			t.Fatalf("responses = %#v", responses.Values())
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
}

func TestBuilderRevertsPastIgnoredSideEffectSteps(t *testing.T) {
	err := withFormEnvironment([]string{
		"A", key.First(key.Enter),
		"B", key.First(key.CtrlU),
		key.First(key.Backspace), "C", key.First(key.Enter),
		"D", key.First(key.Enter),
	}, func(*environment.MemoryOutput) error {
		responses, err := New().
			Text(prompts.TextOptions{Message: "First"}).
			Note("Skipping back over this", output.NoteType(""), "note").
			Text(prompts.TextOptions{Message: "Second"}).
			Submit()
		if err != nil {
			return err
		}

		if responses.At(0) != "C" || responses.Named("note") != nil || responses.At(2) != "D" {
			t.Fatalf("positional=%#v named=%#v", responses.Values(), responses.Names())
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
}

func TestBuilderDoesNotRevertTheFirstStep(t *testing.T) {
	err := withFormEnvironment([]string{key.First(key.CtrlU), "A", key.First(key.Enter)}, func(output *environment.MemoryOutput) error {
		responses, err := New().Text(prompts.TextOptions{Message: "First"}).Submit()
		if err != nil {
			return err
		}

		if responses.At(0) != "A" || !strings.Contains(output.Text(), "This cannot be reverted.") {
			t.Fatalf("response=%#v output=%q", responses.Values(), output.Text())
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
}

func TestBuilderRunsOutputAndStatusAdapters(t *testing.T) {
	err := withFormEnvironment(nil, func(memoryOutput *environment.MemoryOutput) error {
		responses, err := New().
			Info("Preparing", "info").
			Spin("Working", func() (any, error) { return "done", nil }, "spin").
			Submit()
		if err != nil {
			return err
		}

		rendered := memoryOutput.Text()
		if responses.Named("info") != nil || responses.Named("spin") != "done" || !strings.Contains(rendered, "Preparing") || !strings.Contains(rendered, "Working") {
			t.Fatalf("named=%#v output=%q", responses.Names(), rendered)
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
}
