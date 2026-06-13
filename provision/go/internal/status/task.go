package status

import (
	"regexp"
	stdstrings "strings"

	"github.com/oullin/tui/internal/environment"
	"github.com/oullin/tui/internal/terminal"
)

type StableMessage struct {
	Type    string
	Message string
}

type Logger struct {
	LabelValue    string
	SubLabelValue string
	Lines         []string
	Stable        []StableMessage
	limit         int
	stableLimit   int
	partialBuffer string
	partialStart  int
	hasPartial    bool
}

func NewLogger(limit int, label string, subLabel string) *Logger {
	if limit < 0 {
		limit = 0
	}
	if limit == 0 {
		limit = 10
	}
	return &Logger{LabelValue: label, SubLabelValue: subLabel, limit: limit, stableLimit: limit}
}

func (logger *Logger) Limit() int {
	return logger.limit
}

func (logger *Logger) Line(message string) {
	logger.writeLines(stdstrings.TrimRight(message, " \t\r\n"))
}

func (logger *Logger) Log(message string) {
	logger.Line(message)
}

func (logger *Logger) Label(message string) {
	logger.LabelValue = message
}

func (logger *Logger) SubLabel(message string) {
	logger.SubLabelValue = message
}

func (logger *Logger) Partial(chunk string) {
	logger.partialBuffer += chunk
	if !logger.hasPartial {
		logger.partialStart = len(logger.Lines)
		logger.hasPartial = true
	}
	logger.Lines = logger.Lines[:logger.partialStart]
	logger.writeLines(logger.partialBuffer)
	if logger.partialStart > len(logger.Lines) {
		logger.partialStart = len(logger.Lines)
	}
}

func (logger *Logger) CommitPartial() {
	logger.partialBuffer = ""
	logger.partialStart = 0
	logger.hasPartial = false
}

func (logger *Logger) Info(message string) {
	logger.Line(message)
}

func (logger *Logger) Success(message string) {
	logger.stable("success", message)
}

func (logger *Logger) Warning(message string) {
	logger.stable("warning", message)
}

func (logger *Logger) Error(message string) {
	logger.stable("error", message)
}

func (logger *Logger) stable(kind string, message string) {
	logger.Stable = append(logger.Stable, StableMessage{Type: kind, Message: message})
	logger.Lines = nil
	logger.partialBuffer = ""
	logger.hasPartial = false
	for len(logger.Stable) > logger.stableLimit {
		logger.Stable = logger.Stable[1:]
	}
}

func (logger *Logger) writeLines(message string) {
	for _, line := range stdstrings.Split(message, "\n") {
		if line != "" {
			logger.Lines = append(logger.Lines, sanitizeTaskLine(line))
		}
	}
	for len(logger.Lines) > logger.limit {
		logger.Lines = logger.Lines[1:]
	}
}

func Task[T any](label string, callback func(*Logger) (T, error), limit int, keepSummary bool, subLabel string) (T, error) {
	var zero T
	if callback == nil {
		return zero, errMissingCallback("task")
	}
	logger := NewLogger(limit, label, subLabel)
	output := environment.Current().Output
	output.Write(terminal.HideCursorSequence())
	defer output.Write(terminal.ShowCursorSequence())

	frame := RenderTaskFrame(TaskFrameOptions{Label: logger.LabelValue, SubLabel: logger.SubLabelValue, Limit: logger.Limit(), Lines: logger.Lines, StableMessages: logger.Stable})
	output.Write(frame)

	result, err := callback(logger)
	EraseRenderedFrame(frame)
	if err != nil {
		output.Write(RenderTaskFrame(TaskFrameOptions{Label: logger.LabelValue, SubLabel: logger.SubLabelValue, Limit: logger.Limit(), Lines: logger.Lines, StableMessages: logger.Stable}))
		return zero, err
	}
	output.Write(RenderTaskFrame(TaskFrameOptions{Finished: true, KeepSummary: keepSummary, Label: logger.LabelValue, SubLabel: logger.SubLabelValue, Limit: logger.Limit(), Lines: logger.Lines, StableMessages: logger.Stable}))
	return result, nil
}

type TaskFrameOptions struct {
	FrameCount     int
	Finished       bool
	KeepSummary    bool
	Label          string
	Limit          int
	Lines          []string
	StableMessages []StableMessage
	SubLabel       string
}

func RenderTaskFrame(options TaskFrameOptions) string {
	if options.Finished && options.KeepSummary && len(options.StableMessages) > 0 {
		lines := []string{" • " + options.Label}
		for _, message := range options.StableMessages {
			lines = append(lines, renderStableMessage(message))
		}
		lines = append(lines, "")
		return joinLines(lines) + "\n"
	}

	output := []string{stdstrings.TrimRight(RenderSpinnerFrame(options.Label, options.FrameCount), "\n")}
	if options.FrameCount == 0 {
		output[0] = stdstrings.TrimRight(RenderSpinnerFrame(options.Label), "\n")
	}
	if options.SubLabel != "" {
		output = append(output, "   "+options.SubLabel)
	}
	for _, message := range options.StableMessages {
		output = append(output, renderStableMessage(message))
	}
	if len(options.StableMessages) > 0 || len(options.Lines) > 0 {
		output = append(output, " "+stdstrings.Repeat("─", 60))
	} else {
		output = append(output, "")
	}
	visible := options.Lines
	if len(visible) > options.Limit {
		visible = visible[len(visible)-options.Limit:]
	}
	for _, line := range visible {
		output = append(output, " "+line)
	}
	for remaining := options.Limit - len(visible); remaining > 0; remaining-- {
		output = append(output, "")
	}
	return joinLines(output) + "\n"
}

func renderStableMessage(message StableMessage) string {
	symbol := "⚠"
	if message.Type == "success" {
		symbol = "✔"
	}
	if message.Type == "error" {
		symbol = "✘"
	}
	return "   " + symbol + " " + message.Message
}

var taskControlPattern = regexp.MustCompile(`\x1b\[1G|\x1b\[2K|\r`)

func sanitizeTaskLine(line string) string {
	return taskControlPattern.ReplaceAllString(line, "")
}

func joinLines(lines []string) string {
	return stdstrings.Join(lines, "\n")
}
