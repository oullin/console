package prompts

import (
	"errors"

	"github.com/oullin/tui/internal/environment"
	"github.com/oullin/tui/internal/key"
	"github.com/oullin/tui/internal/prompt"
	"github.com/oullin/tui/internal/theme"
	"github.com/oullin/tui/internal/typedvalue"
)

type TextOptions struct {
	Message      string
	Placeholder  string
	Default      string
	Required     prompt.Required
	Validate     prompt.Validator[string]
	Hint         string
	Transform    func(string) (string, error)
	AllowNewLine bool
	Rows         int
}

type typedReadResult struct {
	Cancelled bool
	Value     string
}

func Text(options TextOptions) (string, error) {
	options.AllowNewLine = false
	shouldRenderSubmittedFrame := false
	validate := preserveInvalidTextDefault(&options)

	return prompt.UntilValid(
		prompt.Options[string]{Message: options.Message, Default: transformedDefault(options), Required: options.Required, Validate: validate},
		func(_ int) (string, error) {
			answer, err := readTypedValue(options.Message, options)
			if err != nil {
				return "", err
			}

			value := answer.Value
			if value == "" {
				value = options.Default
			}
			shouldRenderSubmittedFrame = !answer.Cancelled
			return transformText(options, value)
		},
		func(value string) error {
			if shouldRenderSubmittedFrame {
				renderSubmittedTypedValue(options.Message, value)
			}
			return nil
		},
	)
}

func Textarea(options TextOptions) (string, error) {
	options.AllowNewLine = true
	if options.Rows == 0 {
		options.Rows = 5
	}
	shouldRenderSubmittedFrame := false
	validate := preserveInvalidTextDefault(&options)

	return prompt.UntilValid(
		prompt.Options[string]{Message: options.Message, Default: transformedDefault(options), Required: options.Required, Validate: validate},
		func(_ int) (string, error) {
			answer, err := readTypedValue(options.Message, options)
			if err != nil {
				return "", err
			}

			value := answer.Value
			if value == "" {
				value = options.Default
			}
			shouldRenderSubmittedFrame = !answer.Cancelled
			return transformText(options, value)
		},
		func(value string) error {
			if shouldRenderSubmittedFrame {
				renderSubmittedTextareaFrame(options.Message, value)
			}
			return nil
		},
	)
}

func Password(options TextOptions) (string, error) {
	shouldRenderSubmittedFrame := false
	validate := preserveInvalidTextDefault(&options)

	return prompt.UntilValid(
		prompt.Options[string]{Message: options.Message, Default: transformedDefault(options), Required: options.Required, Validate: validate},
		func(_ int) (string, error) {
			answer, err := readPasswordValue(options.Message, options)
			if err != nil {
				return "", err
			}
			shouldRenderSubmittedFrame = !answer.Cancelled
			return transformText(options, answer.Value)
		},
		func(value string) error {
			if shouldRenderSubmittedFrame {
				renderSubmittedPasswordValue(options.Message, value)
			}
			return nil
		},
	)
}

func readTypedValue(message string, options TextOptions) (typedReadResult, error) {
	env := environment.Current()
	state := typedvalue.InitialState(options.Default)

	renderTypedValue(message, state, options)

	for {
		pressed, ok, err := env.Input.ReadKey()
		if err != nil {
			if errors.Is(err, environment.ErrKeyInputUnsupported) {
				answer, lineErr := env.Input.ReadLine(theme.RenderQuestion(message, options.Hint))
				if lineErr != nil {
					return typedReadResult{}, lineErr
				}
				if answer == "" {
					answer = options.Default
				}
				return typedReadResult{Value: answer}, nil
			}
			return typedReadResult{}, err
		}
		if !ok {
			return typedReadResult{Value: state.Value}, nil
		}

		next := typedvalue.ApplyKey(state, pressed, options.AllowNewLine, textareaContentWidth)
		if next.Cancelled {
			if options.AllowNewLine {
				renderCancelledTextareaFrame(message, state.Value, options)
			} else {
				renderCancelledTypedValue(message, state.Value, options)
			}
			value, cancelErr := environment.CancelPrompt(state.Value)
			return typedReadResult{Cancelled: true, Value: value}, cancelErr
		}

		state = typedvalue.State{Cursor: next.Cursor, Value: next.Value}
		if next.Submitted {
			return typedReadResult{Value: state.Value}, nil
		}

		renderTypedValue(message, state, options)
	}
}

func readPasswordValue(message string, options TextOptions) (typedReadResult, error) {
	env := environment.Current()
	state := typedvalue.InitialState(options.Default)

	renderPasswordValue(message, state.Value, options)

	for {
		pressed, ok, err := env.Input.ReadKey()
		if err != nil {
			if errors.Is(err, environment.ErrKeyInputUnsupported) {
				answer, lineErr := env.Input.ReadLine(theme.RenderQuestion(message, options.Hint))
				if lineErr != nil {
					return typedReadResult{}, lineErr
				}
				return typedReadResult{Value: answer}, nil
			}
			return typedReadResult{}, err
		}
		if !ok {
			return typedReadResult{Value: state.Value}, nil
		}

		next := typedvalue.ApplyKey(state, pressed, false)
		if next.Cancelled {
			renderCancelledPasswordValue(message, state.Value, options)
			value, cancelErr := environment.CancelPrompt(state.Value)
			return typedReadResult{Cancelled: true, Value: value}, cancelErr
		}

		state = typedvalue.State{Cursor: next.Cursor, Value: next.Value}
		if next.Submitted {
			return typedReadResult{Value: state.Value}, nil
		}

		renderPasswordValue(message, state.Value, options)
	}
}

func Pause(message string) (bool, error) {
	env := environment.Current()
	if !env.Interactive {
		return false, nil
	}

	env.Output.Write(renderPause(message))
	for {
		pressed, ok, err := env.Input.ReadKey()
		if err != nil {
			if errors.Is(err, environment.ErrKeyInputUnsupported) {
				_, lineErr := prompt.Ask(message, "")
				return lineErr == nil, lineErr
			}
			return false, err
		}
		if !ok || pressed == key.First(key.Enter) {
			env.Output.Write("\n")
			return true, nil
		}
	}
}

func transformedDefault(options TextOptions) string {
	value, err := transformText(options, options.Default)
	if err != nil {
		return options.Default
	}
	return value
}

func transformText(options TextOptions, value string) (string, error) {
	if options.Transform == nil {
		return value, nil
	}

	return options.Transform(value)
}

func preserveInvalidTextDefault(options *TextOptions) prompt.Validator[string] {
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
