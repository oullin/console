package status

import (
	"github.com/oullin/tui/internal/environment"
	"github.com/oullin/tui/internal/terminal"
)

var SpinnerFrames = []string{"⠂", "⠒", "⠐", "⠰", "⠠", "⠤", "⠄", "⠆"}

const StaticSpinnerFrame = "⠶"

func SpinnerFrame(count int) string {
	index := count % len(SpinnerFrames)
	if index < 0 {
		index += len(SpinnerFrames)
	}
	return SpinnerFrames[index]
}

func RenderSpinnerFrame(message string, count ...int) string {
	frame := StaticSpinnerFrame
	if len(count) > 0 {
		frame = SpinnerFrame(count[0])
	}
	return " " + frame + " " + message + "\n"
}

func Spin[T any](message string, callback func() (T, error)) (T, error) {
	var zero T
	if callback == nil {
		return zero, errMissingCallback("spinner")
	}

	output := environment.Current().Output
	frame := RenderSpinnerFrame(message)
	output.Write(terminal.HideCursorSequence())
	output.Write(frame)
	defer output.Write(terminal.ShowCursorSequence())
	defer EraseRenderedFrame(frame)

	return callback()
}

type missingCallbackError string

func (err missingCallbackError) Error() string {
	return string(err)
}

func errMissingCallback(kind string) error {
	return missingCallbackError("a " + kind + " callback is required")
}
