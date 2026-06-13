package status

import (
	"fmt"
	"math"

	"github.com/oullin/tui/internal/environment"
	"github.com/oullin/tui/internal/terminal"
	"github.com/oullin/tui/internal/theme"
)

type Progress struct {
	current       int
	label         string
	hint          string
	renderedFrame string
	cursorHidden  bool
	Total         int
}

func NewProgress(total int, label string, hint string) *Progress {
	if total < 1 {
		total = 1
	}
	return &Progress{Total: total, label: label, hint: hint}
}

func (progress *Progress) Start() {
	progress.render("active")
}

func (progress *Progress) Advance(step int) {
	progress.current += step
	if progress.current < 0 {
		progress.current = 0
	}
	if progress.current > progress.Total {
		progress.current = progress.Total
	}
	progress.render("active")
}

func (progress *Progress) Finish() {
	progress.render("submit")
	progress.restore()
}

func (progress *Progress) Fail() {
	progress.render("error")
	progress.restore()
}

func (progress *Progress) Label(value string) *Progress {
	progress.label = value
	return progress
}

func (progress *Progress) Hint(value string) *Progress {
	progress.hint = value
	return progress
}

func (progress *Progress) Current() int {
	return progress.current
}

func (progress *Progress) Percentage() float64 {
	return float64(progress.current) / float64(progress.Total)
}

func (progress *Progress) Value() bool {
	return true
}

func (progress *Progress) render(state string) {
	output := environment.Current().Output
	if !progress.cursorHidden {
		output.Write(terminal.HideCursorSequence())
		progress.cursorHidden = true
	}
	if progress.renderedFrame != "" {
		EraseRenderedFrame(progress.renderedFrame)
	}
	frame := RenderProgressFrame(progress.current, progress.Total, progress.label, progress.hint, state, 60)
	output.Write(frame)
	progress.renderedFrame = frame
}

func (progress *Progress) restore() {
	if progress.renderedFrame != "" {
		EraseRenderedFrame(progress.renderedFrame)
		progress.renderedFrame = ""
	}
	if progress.cursorHidden {
		environment.Current().Output.Write(terminal.ShowCursorSequence())
		progress.cursorHidden = false
	}
}

func RunProgress[T any, R any](label string, steps []T, callback func(T, *Progress) (R, error)) ([]R, error) {
	bar := NewProgress(len(steps), label, "")
	results := make([]R, 0, len(steps))
	bar.Start()
	for _, step := range steps {
		result, err := callback(step, bar)
		if err != nil {
			bar.Fail()
			return results, err
		}
		results = append(results, result)
		bar.Advance(1)
	}
	bar.Finish()
	return results, nil
}

func RenderProgressFrame(current int, total int, label string, hint string, state string, width int) string {
	if total < 1 {
		total = 1
	}
	filled := int(math.Ceil(float64(width) * float64(current) / float64(total)))
	body := ""
	for range filled {
		body += "█"
	}
	lines := []string{theme.RenderBox(theme.BoxOptions{Body: body, Info: FormatProgressFraction(current, total), Title: label, Width: width})}
	if state == "active" {
		if hint != "" {
			lines = append(lines, "  "+hint)
		} else {
			lines = append(lines, "")
		}
	}
	return joinLines(lines) + "\n"
}

func FormatProgressFraction(current int, total int) string {
	return fmt.Sprintf("%s / %s", formatProgressNumber(current), formatProgressNumber(total))
}

func formatProgressNumber(value int) string {
	text := fmt.Sprintf("%d", value)
	if len(text) <= 3 {
		return text
	}
	out := ""
	for index, char := range text {
		if index > 0 && (len(text)-index)%3 == 0 {
			out += ","
		}
		out += string(char)
	}
	return out
}
