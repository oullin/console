package environment

import "errors"

var ErrKeyInputUnsupported = errors.New("key input is unsupported")

type PromptValidationError struct {
	Message string
}

func (err PromptValidationError) Error() string {
	return err.Message
}

type CancelHandler func(fallback string) (string, error)

var cancelHandler CancelHandler

func CancelUsing(handler CancelHandler) {
	cancelHandler = handler
}

func CancelPrompt(fallback string) (string, error) {
	if cancelHandler == nil {
		return fallback, nil
	}

	return cancelHandler(fallback)
}
