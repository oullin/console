package output

import (
	"github.com/oullin/tui/internal/environment"
	"github.com/oullin/tui/internal/terminal"
)

func Clear() {
	environment.Current().Output.Write(terminal.ClearSequence())
}

func Title(value string) {
	environment.Current().Output.Write(terminal.TitleSequence(value))
}
