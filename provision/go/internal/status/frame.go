package status

import (
	stdstrings "strings"

	"github.com/oullin/tui/internal/environment"
	"github.com/oullin/tui/internal/terminal"
)

func RenderedFrameLineCount(frame string) int {
	trimmed := stdstrings.TrimSuffix(frame, "\n")
	if trimmed == "" {
		return 0
	}
	return len(stdstrings.Split(trimmed, "\n"))
}

func EraseRenderedFrame(frame string) {
	count := RenderedFrameLineCount(frame)
	environment.Current().Output.Write(terminal.ErasePreviousLinesSequence(count))
}
