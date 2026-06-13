package theme

import (
	"fmt"
	stdstrings "strings"

	text "github.com/oullin/tui/internal/strings"
)

const (
	SymbolQuestion   = "?"
	SymbolAnswer     = ">"
	SymbolError      = "!"
	SymbolInfo       = "i"
	SymbolSelected   = "●"
	SymbolUnselected = "○"
	SymbolPointer    = "›"
	SymbolSuccess    = "✓"
	SymbolWarning    = "!"
)

func RenderQuestion(message string, hint string) string {
	suffix := ""
	if hint != "" {
		suffix = " " + hint
	}

	return fmt.Sprintf("%s %s%s ", SymbolQuestion, message, suffix)
}

func RenderError(message string) string {
	return Red(fmt.Sprintf("%s %s", SymbolError, message)) + "\n"
}

func RenderTable(headers []string, rows [][]string) string {
	columnCount := len(headers)
	for _, row := range rows {
		if len(row) > columnCount {
			columnCount = len(row)
		}
	}

	if columnCount <= 0 {
		return ""
	}

	widths := make([]int, columnCount)
	for index := range columnCount {
		widths[index] = text.VisibleWidth(valueAt(headers, index))
		for _, row := range rows {
			width := text.VisibleWidth(valueAt(row, index))
			if width > widths[index] {
				widths[index] = width
			}
		}
	}

	renderRow := func(columns []string) string {
		parts := make([]string, len(widths))
		for index, width := range widths {
			parts[index] = padVisible(valueAt(columns, index), width)
		}

		return " │ " + stdstrings.Join(parts, " │ ") + " │"
	}

	renderBorder := func(left string, middle string, right string) string {
		parts := make([]string, len(widths))
		for index, width := range widths {
			parts[index] = stdstrings.Repeat("─", width+2)
		}

		return " " + left + stdstrings.Join(parts, middle) + right
	}

	top := renderBorder("┌", "┬", "┐")
	divider := renderBorder("├", "┼", "┤")
	bottom := renderBorder("└", "┴", "┘")

	if len(headers) == 0 {
		lines := append([]string{top}, mapRows(rows, renderRow)...)
		lines = append(lines, bottom)
		return stdstrings.Join(lines, "\n")
	}

	dimmedHeaders := make([]string, len(headers))
	for index, header := range headers {
		dimmedHeaders[index] = Dim(header)
	}

	lines := []string{top, renderRow(dimmedHeaders), divider}
	lines = append(lines, mapRows(rows, renderRow)...)
	lines = append(lines, bottom)
	return stdstrings.Join(lines, "\n")
}

func valueAt(values []string, index int) string {
	if index < 0 || index >= len(values) {
		return ""
	}

	return values[index]
}

func padVisible(value string, width int) string {
	padding := width - text.VisibleWidth(value)
	if padding < 0 {
		padding = 0
	}

	return value + stdstrings.Repeat(" ", padding)
}

func mapRows(rows [][]string, render func([]string) string) []string {
	result := make([]string, len(rows))
	for index, row := range rows {
		result[index] = render(row)
	}

	return result
}
