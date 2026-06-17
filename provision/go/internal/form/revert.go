package form

import (
	"errors"

	"github.com/oullin/tui/internal/environment"
	"github.com/oullin/tui/internal/key"
	"github.com/oullin/tui/internal/theme"
)

var ErrReverted = errors.New("form reverted")

type revertInput struct {
	canRevert bool
	previous  environment.Input
}

func runWithRevert(canRevert bool, callback func() (any, error)) (any, error) {
	env := environment.Current()
	if env.Input == nil {
		return callback()
	}

	return callbackWithInput(revertInput{canRevert: canRevert, previous: env.Input}, callback)
}

func callbackWithInput(input environment.Input, callback func() (any, error)) (any, error) {
	returnValue := any(nil)
	err := environment.With(environment.Patch{Input: input}, func() error {
		value, callbackErr := callback()
		returnValue = value
		return callbackErr
	})

	return returnValue, err
}

func (input revertInput) ReadKey() (string, bool, error) {
	pressed, ok, err := input.previous.ReadKey()
	if err != nil || !ok {
		return pressed, ok, err
	}

	if pressed != key.First(key.CtrlU) {
		return pressed, ok, nil
	}

	if input.canRevert {
		return "", false, ErrReverted
	}

	environment.Current().ErrorOutput.Write(theme.Red("  ⚠ This cannot be reverted.") + "\n")
	return input.ReadKey()
}

func (input revertInput) ReadLine(message string) (string, error) {
	return input.previous.ReadLine(message)
}
