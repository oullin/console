package prompts

import (
	"reflect"
	"strings"
	"testing"

	"github.com/oullin/tui/internal/environment"
	"github.com/oullin/tui/internal/key"
	"github.com/oullin/tui/internal/prompt"
	textutil "github.com/oullin/tui/internal/strings"
)

func TestConfirmSelectsAndToggles(t *testing.T) {
	err := withTestEnvironment(environment.NewScriptedInput([]string{"y", key.First(key.Enter)}), func(_ *environment.MemoryOutput) error {
		result, err := Confirm(ConfirmOptions{Message: "Continue?", Default: false, HasDefault: true})
		if err != nil {
			return err
		}
		if !result {
			t.Fatalf("Confirm() = false")
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}

	err = withTestEnvironment(environment.NewScriptedInput([]string{key.First(key.Left), "l", key.First(key.Enter)}), func(output *environment.MemoryOutput) error {
		result, err := Confirm(ConfirmOptions{Message: "Continue?"})
		if err != nil {
			return err
		}
		if !result {
			t.Fatalf("Confirm(toggle) = false")
		}
		if !strings.Contains(output.Text(), "\x1b[36mContinue?\x1b[39m") || !strings.Contains(output.Text(), "\x1b[32m●\x1b[39m Yes") {
			t.Fatalf("confirm output missing active frame:\n%s", output.Text())
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
}

func TestSelectNavigatesDefaultsAndTransforms(t *testing.T) {
	choices := NewStringChoices("first", "second", "third")
	err := withTestEnvironment(environment.NewScriptedInput([]string{key.First(key.Down), key.First(key.Enter)}), func(output *environment.MemoryOutput) error {
		result, err := Select(ChoiceOptions{Message: "Pick one", Choices: choices})
		if err != nil {
			return err
		}
		if result != "second" {
			t.Fatalf("Select() = %#v", result)
		}
		if !strings.Contains(output.Text(), "Pick one") || !strings.Contains(output.Text(), "second") {
			t.Fatalf("select output missing expected frame:\n%s", output.Text())
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}

	interactive := false
	err = environment.With(environment.Patch{Output: environment.NewMemoryOutput(), ErrorOutput: environment.NewMemoryOutput(), Interactive: &interactive}, func() error {
		result, err := Select(ChoiceOptions{
			Message:    "Pick one",
			Choices:    choices,
			Default:    "second",
			HasDefault: true,
			Transform: func(value any) (any, error) {
				return strings.ToUpper(value.(string)), nil
			},
			Validate: func(value any) (string, error) {
				if value == "SECOND" {
					return "", nil
				}
				return "Unexpected value.", nil
			},
		})
		if err != nil {
			return err
		}
		if result != "SECOND" {
			t.Fatalf("noninteractive Select() = %#v", result)
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
}

func TestMultiselectTogglesChoices(t *testing.T) {
	err := withTestEnvironment(environment.NewScriptedInput([]string{key.First(key.Space), key.First(key.Down), key.First(key.Space), key.First(key.Enter)}), func(output *environment.MemoryOutput) error {
		result, err := Multiselect(MultiChoiceOptions{Message: "Pick many", Choices: NewStringChoices("first", "second")})
		if err != nil {
			return err
		}
		if !reflect.DeepEqual(result, []any{"first", "second"}) {
			t.Fatalf("Multiselect() = %#v", result)
		}
		if !strings.Contains(output.Text(), "Use the space bar") {
			t.Fatalf("multiselect output missing hint:\n%s", output.Text())
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
}

func TestSearchFiltersAndValidatesSelections(t *testing.T) {
	colors := func(query string) []Choice {
		all := []Choice{{Label: "Red", Value: "red"}, {Label: "Green", Value: "green"}, {Label: "Blue", Value: "blue"}}
		if query == "" {
			return all
		}
		filtered := make([]Choice, 0)
		for _, choice := range all {
			if strings.Contains(strings.ToLower(choice.Label), strings.ToLower(query)) {
				filtered = append(filtered, choice)
			}
		}
		return filtered
	}

	err := withTestEnvironment(environment.NewScriptedInput([]string{"u", "e", key.First(key.Down), key.First(key.Enter)}), func(output *environment.MemoryOutput) error {
		result, err := Search(SearchOptions{Message: "Favorite color?", Source: colors})
		if err != nil {
			return err
		}
		if result != "blue" {
			t.Fatalf("Search() = %#v", result)
		}
		if !strings.Contains(textutil.ParseAnsiText(output.Text()), "ue") || !strings.Contains(output.Text(), "Blue") {
			t.Fatalf("search output missing query/result:\n%s", output.Text())
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}

	err = withTestEnvironment(environment.NewScriptedInput([]string{key.First(key.Down), key.First(key.Enter), key.First(key.Down), key.First(key.Enter)}), func(output *environment.MemoryOutput) error {
		result, err := Search(SearchOptions{
			Message: "Favorite color?",
			Source:  colors,
			Validate: func(value any) (string, error) {
				if value == "red" {
					return "Please choose green.", nil
				}
				return "", nil
			},
		})
		if err != nil {
			return err
		}
		if result != "green" {
			t.Fatalf("validated Search() = %#v", result)
		}
		if !strings.Contains(output.Text(), "Please choose green.") {
			t.Fatalf("search output missing validation error:\n%s", output.Text())
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
}

func TestMultiSearchMarksHighlightedChoices(t *testing.T) {
	err := withTestEnvironment(environment.NewScriptedInput([]string{key.First(key.Down), key.First(key.Space), key.First(key.Down), key.First(key.Space), key.First(key.Enter)}), func(_ *environment.MemoryOutput) error {
		result, err := MultiSearch(MultiSearchOptions{Message: "Pick colors", Choices: NewStringChoices("red", "green", "blue")})
		if err != nil {
			return err
		}
		if len(result) != 2 || result[0] == result[1] {
			t.Fatalf("MultiSearch() = %#v", result)
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
}

func TestSuggestAndAutocomplete(t *testing.T) {
	err := withTestEnvironment(environment.NewScriptedInput([]string{"b", key.First(key.Tab), key.First(key.Enter)}), func(output *environment.MemoryOutput) error {
		result, err := Suggest(SuggestOptions{Message: "Favorite color?", Options: []string{"Red", "Green", "Blue"}})
		if err != nil {
			return err
		}
		if result != "Blue" {
			t.Fatalf("Suggest() = %q", result)
		}
		if !strings.Contains(output.Text(), "Blue") {
			t.Fatalf("suggest output missing match:\n%s", output.Text())
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}

	err = withTestEnvironment(environment.NewScriptedInput([]string{"b", key.First(key.Tab), key.First(key.Enter)}), func(output *environment.MemoryOutput) error {
		result, err := Autocomplete(SuggestOptions{Message: "Favorite color?", Options: []string{"Red", "Green", "Blue"}})
		if err != nil {
			return err
		}
		if result != "Blue" {
			t.Fatalf("Autocomplete() = %q", result)
		}
		if !strings.Contains(textutil.ParseAnsiText(output.Text()), "Blue") {
			t.Fatalf("autocomplete output missing completion:\n%s", output.Text())
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
}

func TestChoiceRequiredValidation(t *testing.T) {
	interactive := false
	err := environment.With(environment.Patch{Output: environment.NewMemoryOutput(), ErrorOutput: environment.NewMemoryOutput(), Interactive: &interactive}, func() error {
		_, err := Select(ChoiceOptions{Message: "Pick one", Choices: NewStringChoices("first", "second")})
		var validation environment.PromptValidationError
		if err == nil || !errorsAs(err, &validation) || validation.Message != "Required." {
			t.Fatalf("expected required validation error, got %v", err)
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
}

func errorsAs(err error, target *environment.PromptValidationError) bool {
	if validation, ok := err.(environment.PromptValidationError); ok {
		*target = validation
		return true
	}
	return false
}

var _ = prompt.Required{}
