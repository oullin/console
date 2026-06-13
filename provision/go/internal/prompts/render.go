package prompts

import (
	"fmt"
	stdstrings "strings"

	"github.com/oullin/tui/internal/environment"
	"github.com/oullin/tui/internal/strings"
	"github.com/oullin/tui/internal/theme"
	"github.com/oullin/tui/internal/typedvalue"
)

const textareaContentWidth = 60

func renderTypedValue(message string, state typedvalue.State, options TextOptions) {
	env := environment.Current()
	if options.AllowNewLine {
		env.Output.Write(renderTextareaFrame(message, state, options) + "\n")
		if options.Hint != "" {
			env.Output.Write(theme.Dim(options.Hint) + "\n")
		}
		return
	}

	display := theme.Dim(options.Placeholder)
	if state.Value != "" {
		display = typedvalue.VisibleLines(state.Value, state.Cursor, options.Rows)
	}

	env.Output.Write(theme.RenderBox(theme.BoxOptions{Body: display, BorderStyle: theme.Cyan, Info: options.Hint, Title: theme.Cyan(message)}) + "\n")
}

func renderSubmittedTypedValue(message string, value string) {
	environment.Current().Output.Write(theme.RenderBox(theme.BoxOptions{Body: value, Title: theme.Dim(message)}) + "\n")
}

func renderCancelledTypedValue(message string, value string, options TextOptions) {
	env := environment.Current()
	display := value
	if display == "" {
		display = options.Placeholder
	}
	env.Output.Write(theme.RenderBox(theme.BoxOptions{Body: theme.Strikethrough(theme.Dim(display)), BorderStyle: theme.Red, Title: message}) + "\n")
	env.ErrorOutput.Write(theme.Red("  ⚠ Cancelled.") + "\n")
}

func renderTextareaFrame(message string, state typedvalue.State, options TextOptions) string {
	return theme.RenderBox(theme.BoxOptions{Body: textareaBody(state, options), BorderStyle: theme.Cyan, Info: "Ctrl+D to submit", Title: theme.Cyan(message)})
}

func renderSubmittedTextareaFrame(message string, value string) {
	environment.Current().Output.Write(theme.RenderBox(theme.BoxOptions{Body: value, Title: theme.Dim(message)}) + "\n")
}

func renderCancelledTextareaFrame(message string, value string, options TextOptions) {
	env := environment.Current()
	body := textareaCancelledBody(value, options)
	env.Output.Write(theme.RenderBox(theme.BoxOptions{Body: body, BorderStyle: theme.Red, Title: message}) + "\n")
	env.ErrorOutput.Write(theme.Red("  ⚠ Cancelled.") + "\n")
}

func textareaBody(state typedvalue.State, options TextOptions) string {
	rows := options.Rows
	if rows <= 0 {
		rows = 0
	}

	if state.Value == "" {
		return placeholderBody(options, rows)
	}

	window := typedvalue.VisibleLineWindowFor(state.Value, state.Cursor, rows, textareaContentWidth)
	if rows <= 0 {
		return stdstrings.Join(window.Lines, "\n")
	}

	padded := append([]string{}, window.Lines...)
	for len(padded) < rows {
		padded = append(padded, "")
	}
	if len(padded) > rows {
		padded = padded[:rows]
	}

	return stdstrings.Join(renderScrollbarRows(padded, window.Start, rows, window.Total), "\n")
}

func placeholderBody(options TextOptions, rows int) string {
	lines := []string{theme.Dim(options.Placeholder)}
	for rows > 0 && len(lines) < rows {
		lines = append(lines, "")
	}

	return stdstrings.Join(lines, "\n")
}

func textareaCancelledBody(value string, options TextOptions) string {
	text := value
	if text == "" {
		text = options.Placeholder
	}

	lines := stdstrings.Split(text, "\n")
	for index, line := range lines {
		lines[index] = theme.Strikethrough(theme.Dim(line))
	}

	return stdstrings.Join(lines, "\n")
}

func renderPasswordValue(message string, value string, options TextOptions) {
	environment.Current().Output.Write(theme.RenderBox(theme.BoxOptions{Body: passwordDisplay(value, options), BorderStyle: theme.Cyan, Info: options.Hint, Title: theme.Cyan(message)}) + "\n")
}

func renderSubmittedPasswordValue(message string, value string) {
	environment.Current().Output.Write(theme.RenderBox(theme.BoxOptions{Body: maskPassword(value), Title: theme.Dim(message)}) + "\n")
}

func renderCancelledPasswordValue(message string, value string, options TextOptions) {
	env := environment.Current()
	display := maskPassword(value)
	if display == "" {
		display = options.Placeholder
	}
	env.Output.Write(theme.RenderBox(theme.BoxOptions{Body: theme.Strikethrough(theme.Dim(display)), BorderStyle: theme.Red, Title: message}) + "\n")
	env.ErrorOutput.Write(theme.Red("  ⚠ Cancelled.") + "\n")
}

func maskPassword(value string) string {
	return stdstrings.Repeat("•", typedvalue.CharacterLength(value))
}

func passwordDisplay(value string, options TextOptions) string {
	if value != "" {
		return maskPassword(value)
	}

	return theme.Dim(options.Placeholder)
}

func renderNumberValue(message string, value string, options NumberOptions) {
	body := renderNumberBody(value, options, func(text string) string { return text })
	environment.Current().Output.Write(theme.RenderBox(theme.BoxOptions{Body: body, BorderStyle: theme.Cyan, Info: options.Hint, Title: theme.Cyan(message)}) + "\n")
}

func renderSubmittedNumberValue(message string, value any) {
	environment.Current().Output.Write(theme.RenderBox(theme.BoxOptions{Body: fmt.Sprint(value), Title: theme.Dim(message)}) + "\n")
}

func renderCancelledNumberValue(message string, value string, options NumberOptions) {
	env := environment.Current()
	display := value
	if display == "" {
		display = options.Placeholder
	}
	env.Output.Write(theme.RenderBox(theme.BoxOptions{Body: theme.Strikethrough(theme.Dim(display)), BorderStyle: theme.Red, Title: message}) + "\n")
	env.ErrorOutput.Write(theme.Red("  ⚠ Cancelled.") + "\n")
}

func renderNumberBody(value string, options NumberOptions, style func(string) string) string {
	display := value
	if display == "" {
		display = theme.Dim(options.Placeholder)
	}

	return display + "  " + renderNumberArrows(value, options, style)
}

func renderNumberArrows(value string, options NumberOptions, style func(string) string) string {
	numeric, number := parseFloat(value)
	up := style("▲")
	down := style("▼")
	if numeric && options.HasMax && number >= options.Max {
		up = theme.Dim("▲")
	}
	if numeric && options.HasMin && number <= options.Min {
		down = theme.Dim("▼")
	}
	if value != "" && !numeric {
		return theme.Dim("▲") + theme.Dim("▼")
	}

	return up + down
}

func renderPause(message string) string {
	return theme.RenderBox(theme.BoxOptions{Body: "", BorderStyle: theme.Cyan, Title: theme.Cyan(message)})
}

func renderScrollbarRows(lines []string, start int, rows int, total int) []string {
	if rows <= 0 || total <= rows {
		return lines
	}

	result := make([]string, len(lines))
	thumbStart := start * rows / total
	thumbSize := rows * rows / total
	if thumbSize < 1 {
		thumbSize = 1
	}
	if thumbStart+thumbSize > rows {
		thumbStart = rows - thumbSize
	}

	for index, line := range lines {
		bar := theme.Dim("│")
		if index >= thumbStart && index < thumbStart+thumbSize {
			bar = theme.Cyan("┃")
		}
		padding := textareaContentWidth - strings.VisibleWidth(line)
		if padding < 0 {
			padding = 0
		}
		result[index] = line + stdstrings.Repeat(" ", padding) + " " + bar
	}

	return result
}
