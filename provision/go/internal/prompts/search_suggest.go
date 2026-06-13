package prompts

import (
	"errors"
	"reflect"
	stdstrings "strings"

	"github.com/oullin/tui/internal/environment"
	"github.com/oullin/tui/internal/key"
	"github.com/oullin/tui/internal/prompt"
	"github.com/oullin/tui/internal/theme"
	"github.com/oullin/tui/internal/typedvalue"
)

type SearchSource func(query string) []Choice

type SearchOptions struct {
	Message     string
	Choices     []Choice
	Source      SearchSource
	Default     any
	HasDefault  bool
	Required    prompt.Required
	Validate    prompt.Validator[any]
	Placeholder string
	Scroll      int
	Transform   func(any) (any, error)
}

type MultiSearchOptions struct {
	Message     string
	Choices     []Choice
	Source      SearchSource
	Defaults    []any
	Required    prompt.Required
	Validate    prompt.Validator[[]any]
	Placeholder string
	Scroll      int
	Transform   func([]any) ([]any, error)
}

type SuggestSource func(query string) []string

type SuggestOptions struct {
	Message     string
	Options     []string
	Source      SuggestSource
	Placeholder string
	Default     string
	Required    prompt.Required
	Validate    prompt.Validator[string]
	Hint        string
	Scroll      int
	Transform   func(string) (string, error)
}

func Search(options SearchOptions) (any, error) {
	if options.Scroll == 0 {
		options.Scroll = 5
	}
	validate := preserveInvalidSearchDefault(&options)
	defaultValue := options.Default
	if options.HasDefault && options.Transform != nil {
		transformed, err := options.Transform(defaultValue)
		if err == nil {
			defaultValue = transformed
		}
	}

	return prompt.UntilValid(
		prompt.Options[any]{Message: options.Message, Default: defaultValue, Required: requiredDefault(options.Required, true), Validate: validate},
		func(attempt int) (any, error) {
			value, label, submitted, err := readSearchChoice(options, attempt)
			if err != nil {
				return nil, err
			}
			if value == nil {
				return nil, prompt.ValidationError("Please select a valid option.")
			}
			if options.Transform != nil {
				value, err = options.Transform(value)
				if err != nil {
					return nil, err
				}
			}
			if submitted {
				renderSubmittedChoice(options.Message, label)
			}
			return value, nil
		},
		nil,
	)
}

func MultiSearch(options MultiSearchOptions) ([]any, error) {
	if options.Scroll == 0 {
		options.Scroll = 5
	}
	return prompt.UntilValid(
		prompt.Options[[]any]{Message: options.Message, Default: options.Defaults, Required: options.Required, Validate: options.Validate},
		func(_ int) ([]any, error) {
			value, labels, submitted, err := readMultiSearchChoices(options)
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

func Suggest(options SuggestOptions) (string, error) {
	shouldRenderSubmittedFrame := false
	validate := preserveInvalidSuggestDefault(&options)

	return prompt.UntilValid(
		prompt.Options[string]{Message: options.Message, Default: transformedSuggestDefault(options), Required: options.Required, Validate: validate},
		func(_ int) (string, error) {
			value, rendered, err := readSuggestionValue(options)
			if err != nil {
				return "", err
			}
			if value == "" {
				value = options.Default
			}
			shouldRenderSubmittedFrame = rendered
			if options.Transform != nil {
				return options.Transform(value)
			}
			return value, nil
		},
		func(value string) error {
			if shouldRenderSubmittedFrame {
				renderSubmittedTypedValue(options.Message, value)
			}
			return nil
		},
	)
}

func Autocomplete(options SuggestOptions) (string, error) {
	shouldRenderSubmittedFrame := false
	validate := preserveInvalidSuggestDefault(&options)

	return prompt.UntilValid(
		prompt.Options[string]{Message: options.Message, Default: transformedSuggestDefault(options), Required: options.Required, Validate: validate},
		func(_ int) (string, error) {
			value, rendered, err := readAutocompleteValue(options)
			if err != nil {
				return "", err
			}
			if value == "" {
				value = options.Default
			}
			shouldRenderSubmittedFrame = rendered
			if options.Transform != nil {
				return options.Transform(value)
			}
			return value, nil
		},
		func(value string) error {
			if shouldRenderSubmittedFrame {
				renderSubmittedTypedValue(options.Message, value)
			}
			return nil
		},
	)
}

func readSearchChoice(options SearchOptions, attempt int) (any, string, bool, error) {
	env := environment.Current()
	state := typedvalue.State{}
	choices := resolveSearchChoices(options, "")
	highlighted := -1
	if attempt > 0 && len(choices) > 0 {
		highlighted = 0
	}
	renderSearchChoices(options.Message, state.Value, choices, highlighted, nil, false, options.Placeholder, options.Scroll)

	for {
		pressed, ok, err := env.Input.ReadKey()
		if err != nil {
			if errors.Is(err, environment.ErrKeyInputUnsupported) {
				answer, lineErr := env.Input.ReadLine(theme.RenderQuestion(options.Message, ""))
				if lineErr != nil {
					return nil, "", false, lineErr
				}
				if stdstrings.TrimSpace(answer) == "" && options.HasDefault {
					return options.Default, "", false, nil
				}
				choice := findChoice(resolveSearchChoices(options, answer), answer)
				if choice == nil {
					return nil, "", false, nil
				}
				return choice.Value, choice.Label, false, nil
			}
			return nil, "", false, err
		}
		if !ok {
			return options.Default, "", false, nil
		}
		if pressed == key.First(key.CtrlC) {
			renderCancelledSearch(options.Message, state.Value, options.Placeholder)
			if highlighted >= 0 && highlighted < len(choices) && !choices[highlighted].Disabled {
				return choices[highlighted].Value, choices[highlighted].Label, false, nil
			}
			return options.Default, "", false, nil
		}
		if action, ok := searchNavigationDirection(pressed); ok && (highlighted >= 0 || action > 0 || attempt > 0) {
			choices = resolveSearchChoices(options, state.Value)
			highlighted = moveSearchHighlight(choices, highlighted, action, options.Scroll)
			renderSearchChoices(options.Message, state.Value, choices, highlighted, nil, false, options.Placeholder, options.Scroll)
			continue
		}
		if clearsHighlight(pressed) && highlighted >= 0 {
			highlighted = -1
			renderSearchChoices(options.Message, state.Value, choices, highlighted, nil, false, options.Placeholder, options.Scroll)
			continue
		}
		if pressed == key.First(key.Enter) {
			choices = resolveSearchChoices(options, state.Value)
			if highlighted >= 0 && highlighted < len(choices) {
				choice := choices[highlighted]
				return choice.Value, choice.Label, !choice.Disabled, nil
			}
			if state.Value == "" && options.HasDefault {
				choice := choiceByValue(choices, options.Default)
				if choice != nil {
					return choice.Value, choice.Label, true, nil
				}
				return options.Default, "", false, nil
			}
			highlighted = -1
			renderSearchChoices(options.Message, state.Value, choices, highlighted, nil, false, options.Placeholder, options.Scroll)
			continue
		}
		next := typedvalue.ApplyKey(state, pressed, false)
		if next.Cancelled {
			renderCancelledSearch(options.Message, state.Value, options.Placeholder)
			return options.Default, "", false, nil
		}
		state = typedvalue.State{Cursor: next.Cursor, Value: next.Value}
		highlighted = -1
		choices = resolveSearchChoices(options, state.Value)
		renderSearchChoices(options.Message, state.Value, choices, highlighted, nil, false, options.Placeholder, options.Scroll)
	}
}

func readMultiSearchChoices(options MultiSearchOptions) ([]any, []string, bool, error) {
	env := environment.Current()
	state := typedvalue.State{}
	choices := resolveMultiSearchChoices(options, "")
	highlighted := -1
	selected := map[any]string{}
	for _, value := range options.Defaults {
		if choice := choiceByValue(choices, value); choice != nil {
			selected[choice.Value] = choice.Label
		}
	}
	renderSearchChoices(options.Message, state.Value, choices, highlighted, searchMarked(choices, selected), true, options.Placeholder, options.Scroll)

	for {
		pressed, ok, err := env.Input.ReadKey()
		if err != nil {
			if errors.Is(err, environment.ErrKeyInputUnsupported) {
				answer, lineErr := env.Input.ReadLine(theme.RenderQuestion(options.Message, ""))
				if lineErr != nil {
					return nil, nil, false, lineErr
				}
				if stdstrings.TrimSpace(answer) == "" {
					return options.Defaults, nil, false, nil
				}
				return choicesFromCommaSeparated(resolveMultiSearchChoices(options, answer), answer), nil, false, nil
			}
			return nil, nil, false, err
		}
		if !ok || pressed == key.First(key.Enter) {
			values, labels := selectedSearchValues(selected)
			return values, labels, true, nil
		}
		if pressed == key.First(key.CtrlC) {
			renderCancelledSearch(options.Message, state.Value, options.Placeholder)
			values, labels := selectedSearchValues(selected)
			return values, labels, false, nil
		}
		if action, ok := searchNavigationDirection(pressed); ok && (highlighted >= 0 || action > 0) {
			choices = resolveMultiSearchChoices(options, state.Value)
			highlighted = moveSearchHighlight(choices, highlighted, action, options.Scroll)
			renderSearchChoices(options.Message, state.Value, choices, highlighted, searchMarked(choices, selected), true, options.Placeholder, options.Scroll)
			continue
		}
		if pressed == key.First(key.Space) && highlighted >= 0 && highlighted < len(choices) {
			toggleSearchSelection(selected, choices[highlighted])
			renderSearchChoices(options.Message, state.Value, choices, highlighted, searchMarked(choices, selected), true, options.Placeholder, options.Scroll)
			continue
		}
		next := typedvalue.ApplyKey(state, pressed, false)
		if next.Cancelled {
			renderCancelledSearch(options.Message, state.Value, options.Placeholder)
			return options.Defaults, nil, false, nil
		}
		state = typedvalue.State{Cursor: next.Cursor, Value: next.Value}
		highlighted = -1
		choices = resolveMultiSearchChoices(options, state.Value)
		renderSearchChoices(options.Message, state.Value, choices, highlighted, searchMarked(choices, selected), true, options.Placeholder, options.Scroll)
	}
}

func readSuggestionValue(options SuggestOptions) (string, bool, error) {
	env := environment.Current()
	state := typedvalue.InitialState(options.Default)
	highlighted := -1
	matches := resolveSuggestions(options, state.Value)
	renderSuggestions(options.Message, state.Value, matches, highlighted, options.Placeholder, options.Scroll)

	for {
		pressed, ok, err := env.Input.ReadKey()
		if err != nil {
			if errors.Is(err, environment.ErrKeyInputUnsupported) {
				answer, lineErr := env.Input.ReadLine(theme.RenderQuestion(options.Message, options.Hint))
				return answer, false, lineErr
			}
			return "", false, err
		}
		if !ok {
			return state.Value, true, nil
		}
		if action, ok := suggestionNavigationDirection(pressed); ok && (highlighted >= 0 || action > 0) {
			matches = resolveSuggestions(options, state.Value)
			highlighted = moveSuggestionHighlight(matches, highlighted, action, options.Scroll)
			renderSuggestions(options.Message, state.Value, matches, highlighted, options.Placeholder, options.Scroll)
			continue
		}
		if clearsHighlight(pressed) && highlighted >= 0 {
			highlighted = -1
			renderSuggestions(options.Message, state.Value, matches, highlighted, options.Placeholder, options.Scroll)
			continue
		}
		if pressed == key.First(key.Tab) && highlighted < 0 {
			matches = resolveSuggestions(options, state.Value)
			highlighted = moveSuggestionHighlight(matches, highlighted, 1, options.Scroll)
			renderSuggestions(options.Message, state.Value, matches, highlighted, options.Placeholder, options.Scroll)
			continue
		}
		if pressed == key.First(key.Enter) {
			if highlighted >= 0 && highlighted < len(matches) {
				return matches[highlighted], true, nil
			}
			return state.Value, true, nil
		}
		next := typedvalue.ApplyKey(state, pressed, false)
		if next.Cancelled {
			renderCancelledSuggestion(options.Message, state.Value, options.Placeholder)
			value, cancelErr := environment.CancelPrompt(state.Value)
			return value, true, cancelErr
		}
		state = typedvalue.State{Cursor: next.Cursor, Value: next.Value}
		highlighted = -1
		matches = resolveSuggestions(options, state.Value)
		renderSuggestions(options.Message, state.Value, matches, highlighted, options.Placeholder, options.Scroll)
	}
}

func readAutocompleteValue(options SuggestOptions) (string, bool, error) {
	env := environment.Current()
	state := typedvalue.InitialState(options.Default)
	highlighted := 0
	matches := resolveSuggestions(options, state.Value)
	renderAutocomplete(options.Message, state, matches, highlighted, options.Placeholder)

	for {
		pressed, ok, err := env.Input.ReadKey()
		if err != nil {
			if errors.Is(err, environment.ErrKeyInputUnsupported) {
				answer, lineErr := env.Input.ReadLine(theme.RenderQuestion(options.Message, options.Hint))
				return answer, false, lineErr
			}
			return "", false, err
		}
		if !ok {
			return state.Value, true, nil
		}
		if direction, ok := autocompleteNavigationDirection(pressed); ok {
			matches = resolveSuggestions(options, state.Value)
			highlighted = moveSuggestionHighlight(matches, highlighted, direction, 0)
			renderAutocomplete(options.Message, state, matches, highlighted, options.Placeholder)
			continue
		}
		if pressed == key.First(key.Tab) && canAcceptAutocomplete(state) {
			matches = resolveSuggestions(options, state.Value)
			if highlighted >= 0 && highlighted < len(matches) && typedvalue.CharacterLength(matches[highlighted]) > typedvalue.CharacterLength(state.Value) {
				state = typedvalue.InitialState(matches[highlighted])
				matches = resolveSuggestions(options, state.Value)
			} else {
				highlighted = 0
			}
			renderAutocomplete(options.Message, state, matches, highlighted, options.Placeholder)
			continue
		}
		if (pressed == key.First(key.Right) || pressed == key.First(key.RightArrow)) && canAcceptAutocomplete(state) {
			matches = resolveSuggestions(options, state.Value)
			if highlighted >= 0 && highlighted < len(matches) {
				state = typedvalue.InitialState(matches[highlighted])
			}
			renderAutocomplete(options.Message, state, matches, highlighted, options.Placeholder)
			continue
		}
		next := typedvalue.ApplyKey(state, pressed, false)
		if next.Submitted {
			return state.Value, true, nil
		}
		if next.Cancelled {
			renderCancelledSuggestion(options.Message, state.Value, options.Placeholder)
			value, cancelErr := environment.CancelPrompt(state.Value)
			return value, true, cancelErr
		}
		state = typedvalue.State{Cursor: next.Cursor, Value: next.Value}
		highlighted = 0
		matches = resolveSuggestions(options, state.Value)
		renderAutocomplete(options.Message, state, matches, highlighted, options.Placeholder)
	}
}

func renderSearchChoices(message string, query string, choices []Choice, highlighted int, marked map[int]bool, multi bool, placeholder string, scroll int) {
	bodyLines := []string{queryOrPlaceholder(query, placeholder)}
	if len(choices) == 0 {
		bodyLines = append(bodyLines, theme.Dim("  No results."))
	} else {
		rows := make([]string, len(choices))
		for index, choice := range choices {
			pointer := " "
			if index == highlighted {
				pointer = "›"
			}
			prefix := pointer + " "
			if multi {
				if marked[index] {
					prefix += "◼ "
				} else {
					prefix += "◻ "
				}
			}
			label := choice.Label
			if choice.Disabled {
				label = theme.Dim(label)
			}
			if index == highlighted {
				rows[index] = theme.Cyan(prefix) + label
			} else {
				rows[index] = " " + prefix + label
			}
		}
		bodyLines = append(bodyLines, windowedRows(rows, max(highlighted, 0), scroll))
	}
	environment.Current().Output.Write(theme.RenderBox(theme.BoxOptions{Body: stdstrings.Join(bodyLines, "\n"), BorderStyle: theme.Cyan, Title: theme.Cyan(message)}) + "\n")
}

func renderCancelledSearch(message string, query string, placeholder string) {
	env := environment.Current()
	env.Output.Write(theme.RenderBox(theme.BoxOptions{Body: theme.Strikethrough(theme.Dim(queryOrPlaceholder(query, placeholder))), BorderStyle: theme.Red, Title: theme.Dim(message)}) + "\n")
	env.ErrorOutput.Write(theme.Red("  ⚠ Cancelled.") + "\n")
}

func renderSuggestions(message string, query string, matches []string, highlighted int, placeholder string, scroll int) {
	bodyLines := []string{queryOrPlaceholder(query, placeholder)}
	rows := make([]string, len(matches))
	for index, match := range matches {
		pointer := " "
		if index == highlighted {
			pointer = "›"
			rows[index] = theme.Cyan(pointer) + " " + match
		} else {
			rows[index] = "  " + theme.Dim(match)
		}
	}
	if len(rows) > 0 {
		bodyLines = append(bodyLines, windowedRows(rows, max(highlighted, 0), scroll))
	}
	environment.Current().Output.Write(theme.RenderBox(theme.BoxOptions{Body: stdstrings.Join(bodyLines, "\n"), BorderStyle: theme.Cyan, Title: theme.Cyan(message)}) + "\n")
}

func renderAutocomplete(message string, state typedvalue.State, matches []string, highlighted int, placeholder string) {
	body := queryOrPlaceholder(state.Value, placeholder)
	if canAcceptAutocomplete(state) && highlighted >= 0 && highlighted < len(matches) && stdstrings.HasPrefix(stdstrings.ToLower(matches[highlighted]), stdstrings.ToLower(state.Value)) {
		match := matches[highlighted]
		if len(match) > len(state.Value) {
			body = state.Value + theme.Inverse(match[len(state.Value):len(state.Value)+1]) + theme.Dim(match[len(state.Value)+1:])
		} else {
			body = match
		}
	}
	environment.Current().Output.Write(theme.RenderBox(theme.BoxOptions{Body: body, BorderStyle: theme.Cyan, Title: theme.Cyan(message)}) + "\n")
}

func renderCancelledSuggestion(message string, value string, placeholder string) {
	env := environment.Current()
	env.Output.Write(theme.RenderBox(theme.BoxOptions{Body: theme.Strikethrough(theme.Dim(queryOrPlaceholder(value, placeholder))), BorderStyle: theme.Red, Title: message}) + "\n")
	env.ErrorOutput.Write(theme.Red("  ⚠ Cancelled.") + "\n")
}

func resolveSearchChoices(options SearchOptions, query string) []Choice {
	if options.Source != nil {
		return options.Source(query)
	}
	return options.Choices
}

func resolveMultiSearchChoices(options MultiSearchOptions, query string) []Choice {
	if options.Source != nil {
		return options.Source(query)
	}
	return options.Choices
}

func resolveSuggestions(options SuggestOptions, query string) []string {
	values := options.Options
	if options.Source != nil {
		values = options.Source(query)
	}
	if query == "" {
		return values
	}
	filtered := make([]string, 0, len(values))
	lower := stdstrings.ToLower(query)
	for _, value := range values {
		if stdstrings.Contains(stdstrings.ToLower(value), lower) {
			filtered = append(filtered, value)
		}
	}
	return filtered
}

func queryOrPlaceholder(query string, placeholder string) string {
	if query != "" {
		return query
	}
	return theme.Dim(placeholder)
}

func searchNavigationDirection(pressed string) (int, bool) {
	switch pressed {
	case key.First(key.Down), key.First(key.DownArrow), key.First(key.CtrlN):
		return 1, true
	case key.First(key.Up), key.First(key.UpArrow), key.First(key.CtrlP):
		return -1, true
	case key.First(key.PageDown), key.First(key.End):
		return 5, true
	case key.First(key.PageUp), key.Home[0]:
		return -5, true
	default:
		return 0, false
	}
}

func suggestionNavigationDirection(pressed string) (int, bool) {
	if direction, ok := searchNavigationDirection(pressed); ok {
		return direction, true
	}
	switch pressed {
	case key.First(key.Tab):
		return 1, true
	case key.First(key.ShiftTab):
		return -1, true
	default:
		return 0, false
	}
}

func autocompleteNavigationDirection(pressed string) (int, bool) {
	switch pressed {
	case key.First(key.Down), key.First(key.DownArrow):
		return 1, true
	case key.First(key.Up), key.First(key.UpArrow):
		return -1, true
	default:
		return 0, false
	}
}

func moveSearchHighlight(choices []Choice, highlighted int, direction int, scroll int) int {
	if len(choices) == 0 {
		return -1
	}
	index := highlighted
	if index < 0 {
		if direction < 0 {
			index = len(choices)
		} else {
			index = -1
		}
	}
	step := 1
	if direction < 0 {
		step = -1
	}
	attempts := abs(direction)
	if attempts == 0 {
		attempts = 1
	}
	for range attempts {
		index = (index + step + len(choices)) % len(choices)
		for choices[index].Disabled {
			index = (index + step + len(choices)) % len(choices)
		}
	}
	return index
}

func moveSuggestionHighlight(matches []string, highlighted int, direction int, _ int) int {
	if len(matches) == 0 {
		return -1
	}
	if highlighted < 0 {
		if direction < 0 {
			highlighted = len(matches)
		} else {
			highlighted = -1
		}
	}
	next := (highlighted + direction) % len(matches)
	if next < 0 {
		next += len(matches)
	}
	return next
}

func clearsHighlight(pressed string) bool {
	return pressed == key.First(key.Left) || pressed == key.First(key.LeftArrow) || pressed == key.First(key.Right) || pressed == key.First(key.RightArrow) || pressed == key.First(key.CtrlB) || pressed == key.First(key.CtrlF)
}

func canAcceptAutocomplete(state typedvalue.State) bool {
	return state.Cursor >= typedvalue.CharacterLength(state.Value)
}

func preserveInvalidSearchDefault(options *SearchOptions) prompt.Validator[any] {
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

func preserveInvalidSuggestDefault(options *SuggestOptions) prompt.Validator[string] {
	return func(value string) (string, error) {
		if options.Validate == nil {
			return "", nil
		}
		message, err := options.Validate(value)
		if err != nil {
			return "", err
		}
		if message != "" {
			options.Default = value
		}
		return message, nil
	}
}

func transformedSuggestDefault(options SuggestOptions) string {
	if options.Transform == nil {
		return options.Default
	}
	value, err := options.Transform(options.Default)
	if err != nil {
		return options.Default
	}
	return value
}

func searchMarked(choices []Choice, selected map[any]string) map[int]bool {
	marked := map[int]bool{}
	for index, choice := range choices {
		if _, ok := selected[choice.Value]; ok {
			marked[index] = true
		}
	}
	return marked
}

func toggleSearchSelection(selected map[any]string, choice Choice) {
	if choice.Disabled {
		return
	}
	if _, ok := selected[choice.Value]; ok {
		delete(selected, choice.Value)
		return
	}
	selected[choice.Value] = choice.Label
}

func selectedSearchValues(selected map[any]string) ([]any, []string) {
	values := make([]any, 0, len(selected))
	labels := make([]string, 0, len(selected))
	for value, label := range selected {
		values = append(values, value)
		labels = append(labels, label)
	}
	return values, labels
}

func abs(value int) int {
	if value < 0 {
		return -value
	}
	return value
}

func choiceEqual(left any, right any) bool {
	return reflect.DeepEqual(left, right)
}
