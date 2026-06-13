package prompts

import (
	"errors"
	"fmt"
	"math"
	"strconv"
	stdstrings "strings"

	"github.com/oullin/tui/internal/environment"
	"github.com/oullin/tui/internal/key"
	"github.com/oullin/tui/internal/prompt"
	"github.com/oullin/tui/internal/theme"
	"github.com/oullin/tui/internal/typedvalue"
)

type NumberOptions struct {
	Message     string
	Placeholder string
	Default     string
	HasDefault  bool
	Required    prompt.Required
	Validate    prompt.Validator[any]
	Hint        string
	Min         float64
	HasMin      bool
	Max         float64
	HasMax      bool
	Step        float64
	HasStep     bool
	Transform   func(any) (any, error)
}

func Number(options NumberOptions) (any, error) {
	shouldRenderSubmittedFrame := false
	defaultValue, defaultErr := numberDefault(options)
	if defaultErr != nil {
		return nil, defaultErr
	}

	return prompt.UntilValid(
		prompt.Options[any]{Message: options.Message, Default: defaultValue, Required: options.Required, Validate: options.Validate},
		func(_ int) (any, error) {
			answer, err := readNumberValue(options.Message, options)
			if err != nil {
				return nil, err
			}

			shouldRenderSubmittedFrame = !answer.Cancelled
			if answer.Value == "" && options.HasDefault {
				return numberDefault(options)
			}

			parsed, err := ParseNumberInput(answer.Value, options)
			if err != nil {
				return nil, err
			}

			return transformNumber(options, parsed)
		},
		func(value any) error {
			if shouldRenderSubmittedFrame {
				renderSubmittedNumberValue(options.Message, value)
			}
			return nil
		},
	)
}

func numberDefault(options NumberOptions) (any, error) {
	if !options.HasDefault {
		return "", nil
	}

	parsed, err := ParseNumberInput(options.Default, options)
	if err != nil {
		return nil, err
	}

	return transformNumber(options, parsed)
}

func transformNumber(options NumberOptions, value any) (any, error) {
	if options.Transform == nil {
		return value, nil
	}

	return options.Transform(value)
}

func readNumberValue(message string, options NumberOptions) (typedReadResult, error) {
	env := environment.Current()
	state := typedvalue.State{}
	if options.HasDefault {
		state = typedvalue.InitialState(options.Default)
	}

	renderNumberValue(message, state.Value, options)

	for {
		pressed, ok, err := env.Input.ReadKey()
		if err != nil {
			if errors.Is(err, environment.ErrKeyInputUnsupported) {
				answer, lineErr := env.Input.ReadLine(theme.RenderQuestion(message, options.Hint))
				if lineErr != nil {
					return typedReadResult{}, lineErr
				}
				if answer == "" && options.HasDefault {
					answer = options.Default
				}
				return typedReadResult{Value: answer}, nil
			}
			return typedReadResult{}, err
		}
		if !ok {
			return typedReadResult{Value: state.Value}, nil
		}

		if pressed == key.First(key.Up) || pressed == key.First(key.UpArrow) {
			state.Value = steppedNumberValue(state.Value, 1, options)
			state.Cursor = typedvalue.CharacterLength(state.Value)
			renderNumberValue(message, state.Value, options)
			continue
		}

		if pressed == key.First(key.Down) || pressed == key.First(key.DownArrow) {
			state.Value = steppedNumberValue(state.Value, -1, options)
			state.Cursor = typedvalue.CharacterLength(state.Value)
			renderNumberValue(message, state.Value, options)
			continue
		}

		next := typedvalue.ApplyKey(state, pressed, false)
		if next.Cancelled {
			renderCancelledNumberValue(message, state.Value, options)
			value, cancelErr := environment.CancelPrompt(state.Value)
			return typedReadResult{Cancelled: true, Value: value}, cancelErr
		}

		state = typedvalue.State{Cursor: next.Cursor, Value: next.Value}
		if next.Submitted {
			return typedReadResult{Value: state.Value}, nil
		}

		renderNumberValue(message, state.Value, options)
	}
}

func ParseNumberInput(input string, options NumberOptions) (any, error) {
	normalized := stdstrings.TrimSpace(input)
	if normalized == "" {
		return "", nil
	}

	numeric, number := parseFloat(normalized)
	if !numeric {
		return nil, prompt.ValidationError("Must be a number")
	}

	if options.HasMin && number < options.Min {
		return nil, prompt.ValidationError(fmt.Sprintf("Must be at least %s", formatNumber(options.Min)))
	}

	if options.HasMax && number > options.Max {
		return nil, prompt.ValidationError(fmt.Sprintf("Must be less than %s", formatNumber(options.Max)))
	}

	return int(math.Trunc(number)), nil
}

func steppedNumberValue(value string, direction int, options NumberOptions) string {
	step := numberStep(options)
	if value == "" {
		if direction == 1 {
			if options.HasMin {
				return formatNumber(options.Min)
			}
			return "1"
		}
		if options.HasMax {
			return formatNumber(options.Max)
		}
		return "0"
	}

	numeric, number := parseFloat(value)
	if !numeric {
		return value
	}

	next := math.Trunc(number) + float64(step*direction)
	if options.HasMin && next < options.Min {
		next = options.Min
	}
	if options.HasMax && next > options.Max {
		next = options.Max
	}

	return formatNumber(next)
}

func numberStep(options NumberOptions) int {
	if options.HasStep && options.Step > 0 {
		truncated := int(math.Trunc(options.Step))
		if truncated > 1 {
			return truncated
		}
	}

	return 1
}

func parseFloat(value string) (bool, float64) {
	if stdstrings.TrimSpace(value) == "" {
		return false, 0
	}
	number, err := strconv.ParseFloat(value, 64)
	if err != nil || math.IsInf(number, 0) || math.IsNaN(number) {
		return false, 0
	}
	return true, number
}

func formatNumber(value float64) string {
	if math.Trunc(value) == value {
		return strconv.FormatInt(int64(value), 10)
	}

	return strconv.FormatFloat(value, 'f', -1, 64)
}
