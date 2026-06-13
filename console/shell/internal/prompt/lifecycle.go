package prompt

import (
	"errors"

	"github.com/oullin/tui/internal/environment"
	"github.com/oullin/tui/internal/theme"
)

type Options[T any] struct {
	Message  string
	Default  T
	Required Required
	Validate Validator[T]
}

type Reader[T any] func(attempt int) (T, error)
type OnValid[T any] func(T) error

func UntilValid[T any](options Options[T], read Reader[T], onValid OnValid[T]) (T, error) {
	env := environment.Current()

	if !env.Interactive {
		value := options.Default
		if err := EnsureValid(value, options.Required, options.Validate); err != nil {
			return value, err
		}

		return value, nil
	}

	attempt := 0
	for {
		value, err := read(attempt)
		if err != nil {
			var validation environment.PromptValidationError
			if errors.As(err, &validation) {
				env.ErrorOutput.Write(theme.RenderError(validation.Message))
				attempt++
				continue
			}

			return value, err
		}

		if err := EnsureValid(value, options.Required, options.Validate); err != nil {
			var validation environment.PromptValidationError
			if errors.As(err, &validation) {
				env.ErrorOutput.Write(theme.RenderError(validation.Message))
				options.Default = value
				attempt++
				continue
			}

			return value, err
		}

		if onValid != nil {
			if err := onValid(value); err != nil {
				return value, err
			}
		}

		return value, nil
	}
}

func Ask(message string, hint string) (string, error) {
	env := environment.Current()
	return env.Input.ReadLine(theme.RenderQuestion(message, hint))
}
