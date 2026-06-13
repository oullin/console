package prompts

import (
	"errors"
	"fmt"
	"reflect"
	"sort"
	"strconv"
	stdstrings "strings"

	"github.com/oullin/tui/internal/environment"
	"github.com/oullin/tui/internal/key"
	"github.com/oullin/tui/internal/prompt"
	"github.com/oullin/tui/internal/theme"
	"github.com/oullin/tui/internal/typedvalue"
)

type Choice struct {
	Label          string
	Value          any
	Disabled       bool
	DisabledReason string
	Hint           string
}

type ChoiceOptions struct {
	Message    string
	Choices    []Choice
	Default    any
	HasDefault bool
	Required   prompt.Required
	Validate   prompt.Validator[any]
	Hint       string
	Scroll     int
	Transform  func(any) (any, error)
}

type MultiChoiceOptions struct {
	Message   string
	Choices   []Choice
	Defaults  []any
	Required  prompt.Required
	Validate  prompt.Validator[[]any]
	Hint      string
	Scroll    int
	Transform func([]any) ([]any, error)
}

type ConfirmOptions struct {
	Message    string
	Default    bool
	HasDefault bool
	Yes        string
	No         string
	Required   prompt.Required
	Validate   prompt.Validator[bool]
	Hint       string
	Transform  func(bool) (bool, error)
}

func NewStringChoices(values ...string) []Choice {
	choices := make([]Choice, len(values))
	for index, value := range values {
		choices[index] = Choice{Label: value, Value: value}
	}

	return choices
}

func Select(options ChoiceOptions) (any, error) {
	if options.Scroll == 0 {
		options.Scroll = 5
	}
	validate := preserveInvalidChoiceDefault(&options)
	defaultValue := transformedChoiceDefault(options)

	return prompt.UntilValid(
		prompt.Options[any]{Message: options.Message, Default: defaultValue, Required: requiredDefault(options.Required, true), Validate: validate},
		func(_ int) (any, error) {
			value, label, submitted, err := readSelectedChoice(options)
			if err != nil {
				return nil, err
			}
			value, err = transformChoice(options, value)
			if err != nil {
				return nil, err
			}
			if submitted {
				renderSubmittedChoice(options.Message, label)
			}
			return value, nil
		},
		nil,
	)
}

func Multiselect(options MultiChoiceOptions) ([]any, error) {
	if options.Scroll == 0 {
		options.Scroll = 5
	}

	defaultValue := options.Defaults
	if options.Transform != nil {
		transformed, err := options.Transform(defaultValue)
		if err == nil {
			defaultValue = transformed
		}
	}

	return prompt.UntilValid(
		prompt.Options[[]any]{Message: options.Message, Default: defaultValue, Required: options.Required, Validate: options.Validate},
		func(_ int) ([]any, error) {
			value, labels, submitted, err := readMultipleChoices(options)
			if err != nil {
				return nil, err
			}
			if options.Transform != nil {
				value, err = options.Transform(value)
				if err != nil {
					return nil, err
				}
			}
			if submitted {
				renderSubmittedChoices(options.Message, labels)
			}
			return value, nil
		},
		nil,
	)
}

func Confirm(options ConfirmOptions) (bool, error) {
	if options.Yes == "" {
		options.Yes = "Yes"
	}
	if options.No == "" {
		options.No = "No"
	}
	defaultValue := true
	if options.HasDefault {
		defaultValue = options.Default
	}
	if options.Transform != nil {
		transformed, err := options.Transform(defaultValue)
		if err == nil {
			defaultValue = transformed
		}
	}

	return prompt.UntilValid(
		prompt.Options[bool]{Message: options.Message, Default: defaultValue, Required: options.Required, Validate: options.Validate},
		func(_ int) (bool, error) {
			value, submitted, err := readConfirm(options)
			if err != nil {
				return false, err
			}
			if options.Transform != nil {
				value, err = options.Transform(value)
				if err != nil {
					return false, err
				}
			}
			if submitted {
				renderSubmittedConfirm(options, value)
			}
			return value, nil
		},
		nil,
	)
}

func readSelectedChoice(options ChoiceOptions) (any, string, bool, error) {
	env := environment.Current()
	selected := defaultChoiceIndex(options.Choices, options.Default, options.HasDefault)

	renderSelectedChoice(options.Message, options.Choices, selected, options.Scroll)
	for {
		pressed, ok, err := env.Input.ReadKey()
		if err != nil {
			if errors.Is(err, environment.ErrKeyInputUnsupported) {
				answer, lineErr := env.Input.ReadLine(choiceLineQuestion(options.Message, options.Choices, options.Hint))
				if lineErr != nil {
					return nil, "", false, lineErr
				}
				if stdstrings.TrimSpace(answer) == "" && options.HasDefault {
					choice := choiceByValue(options.Choices, options.Default)
					if choice != nil {
						return choice.Value, choice.Label, false, nil
					}
				}
				choice := findChoice(options.Choices, answer)
				if choice == nil || choice.Disabled {
					return nil, "", false, prompt.ValidationError("Please select a valid option.")
				}
				return choice.Value, choice.Label, false, nil
			}
			return nil, "", false, err
		}
		if !ok {
			if options.HasDefault {
				choice := choiceByValue(options.Choices, options.Default)
				if choice != nil {
					return choice.Value, choice.Label, false, nil
				}
			}
			return nil, "", false, prompt.ValidationError("Please select a valid option.")
		}

		if pressed == key.First(key.CtrlC) {
			renderCancelledChoice(options.Message, options.Choices, selected, options.Scroll)
			choice := options.Choices[selected]
			value, cancelErr := environment.CancelPrompt(fmt.Sprint(choice.Value))
			if cancelErr != nil {
				return nil, "", false, cancelErr
			}
			return valueOrOriginal(choice.Value, value), choice.Label, false, nil
		}

		if numeric, ok := choiceIndex(pressed); ok && numeric >= 0 && numeric < len(options.Choices) && !options.Choices[numeric].Disabled {
			choice := options.Choices[numeric]
			return choice.Value, choice.Label, true, nil
		}

		if action, ok := navigationDirection(pressed); ok {
			selected = moveChoiceHighlight(options.Choices, selected, action)
			renderSelectedChoice(options.Message, options.Choices, selected, options.Scroll)
			continue
		}

		if pressed == key.First(key.Enter) {
			choice := options.Choices[selected]
			if choice.Disabled {
				return nil, "", false, prompt.ValidationError("Please select a valid option.")
			}
			return choice.Value, choice.Label, true, nil
		}
	}
}

func readMultipleChoices(options MultiChoiceOptions) ([]any, []string, bool, error) {
	env := environment.Current()
	selected := firstEnabledIndex(options.Choices)
	marked := markedChoiceIndexes(options.Choices, options.Defaults)

	renderMultipleChoices(options.Message, options.Choices, selected, marked, options.Scroll)
	for {
		pressed, ok, err := env.Input.ReadKey()
		if err != nil {
			if errors.Is(err, environment.ErrKeyInputUnsupported) {
				answer, lineErr := env.Input.ReadLine(choiceLineQuestion(options.Message, options.Choices, options.Hint))
				if lineErr != nil {
					return nil, nil, false, lineErr
				}
				if stdstrings.TrimSpace(answer) == "" {
					return options.Defaults, nil, false, nil
				}
				return choicesFromCommaSeparated(options.Choices, answer), nil, false, nil
			}
			return nil, nil, false, err
		}
		if !ok || pressed == key.First(key.Enter) {
			return markedChoiceValues(options.Choices, marked), markedChoiceLabels(options.Choices, marked), true, nil
		}
		if pressed == key.First(key.CtrlC) {
			renderCancelledChoices(options.Message, options.Choices, selected, marked, options.Scroll)
			return markedChoiceValues(options.Choices, marked), markedChoiceLabels(options.Choices, marked), false, nil
		}
		if stdstrings.Contains(pressed, ",") {
			return choicesFromCommaSeparated(options.Choices, pressed), nil, false, nil
		}
		if numeric, ok := choiceIndex(pressed); ok && numeric >= 0 && numeric < len(options.Choices) && !options.Choices[numeric].Disabled {
			toggleMarked(marked, numeric)
			renderMultipleChoices(options.Message, options.Choices, selected, marked, options.Scroll)
			continue
		}
		if action, ok := navigationDirection(pressed); ok {
			selected = moveChoiceHighlight(options.Choices, selected, action)
			renderMultipleChoices(options.Message, options.Choices, selected, marked, options.Scroll)
			continue
		}
		if pressed == key.First(key.CtrlA) {
			marked = toggleAllEnabledChoices(options.Choices, marked)
			renderMultipleChoices(options.Message, options.Choices, selected, marked, options.Scroll)
			continue
		}
		if pressed == key.First(key.Space) {
			if !options.Choices[selected].Disabled {
				toggleMarked(marked, selected)
			}
			renderMultipleChoices(options.Message, options.Choices, selected, marked, options.Scroll)
			continue
		}
	}
}

func readConfirm(options ConfirmOptions) (bool, bool, error) {
	env := environment.Current()
	confirmed := true
	if options.HasDefault {
		confirmed = options.Default
	}
	renderActiveConfirm(options, confirmed)

	for {
		pressed, ok, err := env.Input.ReadKey()
		if err != nil {
			if errors.Is(err, environment.ErrKeyInputUnsupported) {
				suffix := " [Y/n]"
				if options.HasDefault && !options.Default {
					suffix = " [y/N]"
				}
				answer, lineErr := env.Input.ReadLine(theme.RenderQuestion(options.Message+suffix, options.Hint))
				if lineErr != nil {
					return false, false, lineErr
				}
				normalized := stdstrings.ToLower(stdstrings.TrimSpace(answer))
				if normalized == "" && options.HasDefault {
					return options.Default, false, nil
				}
				return normalized == "y" || normalized == "yes" || normalized == stdstrings.ToLower(options.Yes), false, nil
			}
			return false, false, err
		}
		if !ok {
			return confirmed, true, nil
		}
		switch stdstrings.ToLower(pressed) {
		case "y":
			confirmed = true
			renderActiveConfirm(options, confirmed)
		case "n":
			confirmed = false
			renderActiveConfirm(options, confirmed)
		default:
			if pressed == key.First(key.Enter) {
				return confirmed, true, nil
			}
			if pressed == key.First(key.CtrlC) {
				renderCancelledConfirm(options, confirmed)
				return confirmed, false, nil
			}
			if isConfirmToggleKey(pressed) {
				confirmed = !confirmed
				renderActiveConfirm(options, confirmed)
			}
		}
	}
}

func renderSelectedChoice(message string, choices []Choice, selected int, scroll int) {
	rows := choiceRows(choices, selected, nil, false)
	environment.Current().Output.Write(theme.RenderBox(theme.BoxOptions{Body: windowedRows(rows, selected, scroll), BorderStyle: theme.Cyan, Title: theme.Cyan(message)}) + "\n")
}

func renderMultipleChoices(message string, choices []Choice, selected int, marked map[int]bool, scroll int) {
	rows := choiceRows(choices, selected, marked, true)
	environment.Current().Output.Write(theme.RenderBox(theme.BoxOptions{Body: windowedRows(rows, selected, scroll), BorderStyle: theme.Cyan, Info: "Use the space bar to select options.", Title: theme.Cyan(message)}) + "\n")
}

func renderCancelledChoice(message string, choices []Choice, selected int, scroll int) {
	rows := choiceRows(choices, selected, nil, false)
	env := environment.Current()
	env.Output.Write(theme.RenderBox(theme.BoxOptions{Body: windowedRows(rows, selected, scroll), BorderStyle: theme.Red, Title: message}) + "\n")
	env.ErrorOutput.Write(theme.Red("  ⚠ Cancelled.") + "\n")
}

func renderCancelledChoices(message string, choices []Choice, selected int, marked map[int]bool, scroll int) {
	rows := choiceRows(choices, selected, marked, true)
	env := environment.Current()
	env.Output.Write(theme.RenderBox(theme.BoxOptions{Body: windowedRows(rows, selected, scroll), BorderStyle: theme.Red, Title: message}) + "\n")
	env.ErrorOutput.Write(theme.Red("  ⚠ Cancelled.") + "\n")
}

func renderSubmittedChoice(message string, label string) {
	environment.Current().Output.Write(theme.RenderBox(theme.BoxOptions{Body: label, Title: theme.Dim(message)}) + "\n")
}

func renderSubmittedChoices(message string, labels []string) {
	environment.Current().Output.Write(theme.RenderBox(theme.BoxOptions{Body: stdstrings.Join(labels, "\n"), Title: theme.Dim(message)}) + "\n")
}

func renderActiveConfirm(options ConfirmOptions, confirmed bool) {
	yes := "○ " + options.Yes
	no := "○ " + options.No
	if confirmed {
		yes = theme.Green("●") + " " + options.Yes
	} else {
		no = theme.Green("●") + " " + options.No
	}
	environment.Current().Output.Write(theme.RenderBox(theme.BoxOptions{Body: yes + " / " + no, BorderStyle: theme.Cyan, Info: options.Hint, Title: theme.Cyan(options.Message)}) + "\n")
}

func renderCancelledConfirm(options ConfirmOptions, confirmed bool) {
	yes := "○ " + options.Yes
	no := "○ " + options.No
	if confirmed {
		yes = "● " + options.Yes
	} else {
		no = "● " + options.No
	}
	env := environment.Current()
	env.Output.Write(theme.RenderBox(theme.BoxOptions{Body: yes + " / " + no, BorderStyle: theme.Red, Title: options.Message}) + "\n")
	env.ErrorOutput.Write(theme.Red("  ⚠ Cancelled.") + "\n")
}

func renderSubmittedConfirm(options ConfirmOptions, value bool) {
	label := options.No
	if value {
		label = options.Yes
	}
	environment.Current().Output.Write(theme.RenderBox(theme.BoxOptions{Body: label, Title: theme.Dim(options.Message)}) + "\n")
}

func choiceRows(choices []Choice, selected int, marked map[int]bool, multiple bool) []string {
	rows := make([]string, len(choices))
	for index, choice := range choices {
		pointer := " "
		if index == selected {
			pointer = "›"
		}
		marker := "○"
		if multiple {
			if marked[index] {
				marker = "◼"
			} else {
				marker = "◻"
			}
		} else if index == selected {
			marker = "●"
		}
		label := choice.Label
		if choice.Hint != "" {
			label += " " + choice.Hint
		}
		if choice.Disabled {
			reason := "disabled"
			if choice.DisabledReason != "" {
				reason = choice.DisabledReason
			}
			label += " (" + reason + ")"
		}
		if index == selected {
			rows[index] = theme.Cyan(pointer+" "+marker) + " " + label
		} else {
			rows[index] = "  " + marker + " " + label
		}
	}
	return rows
}

func windowedRows(rows []string, selected int, scroll int) string {
	if scroll <= 0 || scroll >= len(rows) {
		return stdstrings.Join(rows, "\n")
	}
	start := selected - (scroll-1)/2
	if start < 0 {
		start = 0
	}
	if start+scroll > len(rows) {
		start = len(rows) - scroll
	}
	window := append([]string{}, rows[start:start+scroll]...)
	return stdstrings.Join(renderScrollbarRows(window, start, scroll, len(rows)), "\n")
}

func choiceLineQuestion(message string, choices []Choice, hint string) string {
	rendered := make([]string, len(choices))
	for index, choice := range choices {
		rendered[index] = fmt.Sprintf("  %d. %s", index+1, choice.Label)
	}
	return theme.RenderQuestion(message+"\n"+stdstrings.Join(rendered, "\n")+"\n", hint)
}

func firstEnabledIndex(choices []Choice) int {
	for index, choice := range choices {
		if !choice.Disabled {
			return index
		}
	}
	return 0
}

func defaultChoiceIndex(choices []Choice, value any, hasDefault bool) int {
	if !hasDefault {
		return firstEnabledIndex(choices)
	}
	for index, choice := range choices {
		if !choice.Disabled && reflect.DeepEqual(choice.Value, value) {
			return index
		}
	}
	return firstEnabledIndex(choices)
}

func choiceByValue(choices []Choice, value any) *Choice {
	for index, choice := range choices {
		if !choice.Disabled && reflect.DeepEqual(choice.Value, value) {
			return &choices[index]
		}
	}
	return nil
}

func findChoice(choices []Choice, answer string) *Choice {
	normalized := stdstrings.TrimSpace(answer)
	if numeric, err := strconv.Atoi(normalized); err == nil {
		index := numeric - 1
		if index >= 0 && index < len(choices) {
			return &choices[index]
		}
	}
	for index, choice := range choices {
		if choice.Label == normalized || fmt.Sprint(choice.Value) == normalized {
			return &choices[index]
		}
	}
	return nil
}

func moveChoiceHighlight(choices []Choice, current int, direction int) int {
	if len(choices) == 0 {
		return 0
	}
	index := current
	for range choices {
		index = (index + direction + len(choices)) % len(choices)
		if !choices[index].Disabled {
			return index
		}
	}
	return current
}

func navigationDirection(pressed string) (int, bool) {
	switch pressed {
	case key.First(key.Down), key.First(key.DownArrow), key.First(key.Tab), "j", "l", key.First(key.Right), key.First(key.RightArrow), key.First(key.CtrlN), key.First(key.CtrlF):
		return 1, true
	case key.First(key.Up), key.First(key.UpArrow), key.First(key.ShiftTab), "k", "h", key.First(key.Left), key.First(key.LeftArrow), key.First(key.CtrlP), key.First(key.CtrlB):
		return -1, true
	default:
		return 0, false
	}
}

func choiceIndex(value string) (int, bool) {
	numeric, err := strconv.Atoi(value)
	if err != nil {
		return 0, false
	}
	return numeric - 1, true
}

func markedChoiceIndexes(choices []Choice, defaults []any) map[int]bool {
	marked := map[int]bool{}
	for index, choice := range choices {
		for _, value := range defaults {
			if reflect.DeepEqual(choice.Value, value) {
				marked[index] = true
			}
		}
	}
	return marked
}

func markedChoiceValues(choices []Choice, marked map[int]bool) []any {
	indexes := sortedMarkedIndexes(marked)
	values := make([]any, 0, len(indexes))
	for _, index := range indexes {
		values = append(values, choices[index].Value)
	}
	return values
}

func markedChoiceLabels(choices []Choice, marked map[int]bool) []string {
	indexes := sortedMarkedIndexes(marked)
	labels := make([]string, 0, len(indexes))
	for _, index := range indexes {
		labels = append(labels, choices[index].Label)
	}
	return labels
}

func sortedMarkedIndexes(marked map[int]bool) []int {
	indexes := make([]int, 0, len(marked))
	for index, enabled := range marked {
		if enabled {
			indexes = append(indexes, index)
		}
	}
	sort.Ints(indexes)
	return indexes
}

func toggleMarked(marked map[int]bool, index int) {
	if marked[index] {
		delete(marked, index)
	} else {
		marked[index] = true
	}
}

func toggleAllEnabledChoices(choices []Choice, marked map[int]bool) map[int]bool {
	allMarked := true
	for index, choice := range choices {
		if !choice.Disabled && !marked[index] {
			allMarked = false
			break
		}
	}
	next := map[int]bool{}
	if !allMarked {
		for index, choice := range choices {
			if !choice.Disabled {
				next[index] = true
			}
		}
	}
	return next
}

func choicesFromCommaSeparated(choices []Choice, answer string) []any {
	parts := stdstrings.Split(answer, ",")
	values := make([]any, 0, len(parts))
	for _, part := range parts {
		choice := findChoice(choices, part)
		if choice != nil && !choice.Disabled {
			values = append(values, choice.Value)
		}
	}
	return values
}

func isConfirmToggleKey(pressed string) bool {
	_, ok := navigationDirection(pressed)
	return ok || pressed == key.First(key.PageDown) || pressed == key.First(key.PageUp)
}

func valueOrOriginal(original any, value string) any {
	if value == fmt.Sprint(original) {
		return original
	}
	return value
}

func transformChoice(options ChoiceOptions, value any) (any, error) {
	if options.Transform == nil {
		return value, nil
	}
	return options.Transform(value)
}

func transformedChoiceDefault(options ChoiceOptions) any {
	if !options.HasDefault {
		return nil
	}
	value, err := transformChoice(options, options.Default)
	if err != nil {
		return options.Default
	}
	return value
}

func preserveInvalidChoiceDefault(options *ChoiceOptions) prompt.Validator[any] {
	return func(value any) (string, error) {
		if options.Validate == nil {
			return "", nil
		}
		message, err := options.Validate(value)
		if err != nil {
			return "", err
		}
		if message != "" {
			options.Default = value
			options.HasDefault = true
		}
		return message, nil
	}
}

func requiredDefault(required prompt.Required, enabled bool) prompt.Required {
	if required.Enabled || required.Message != "" {
		return required
	}
	return prompt.Required{Enabled: enabled}
}

func currentInputState(value string) typedvalue.State {
	return typedvalue.State{Cursor: typedvalue.CharacterLength(value), Value: value}
}
