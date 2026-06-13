package theme

import (
	stdstrings "strings"

	text "github.com/oullin/tui/internal/strings"
)

const defaultBoxWidth = 60

type BoxOptions struct {
	Body        string
	BorderStyle func(string) string
	Info        string
	Title       string
	Width       int
}

func RenderBox(options BoxOptions) string {
	borderStyle := options.BorderStyle
	if borderStyle == nil {
		borderStyle = func(value string) string { return value }
	}

	width := options.Width
	if width == 0 {
		width = defaultBoxWidth
	}

	bodyLines := stdstrings.Split(options.Body, "\n")
	contentWidth := width
	if titleWidth := text.VisibleWidth(options.Title); titleWidth > contentWidth {
		contentWidth = titleWidth
	}
	for _, line := range bodyLines {
		if lineWidth := text.VisibleWidth(line); lineWidth > contentWidth {
			contentWidth = lineWidth
		}
	}

	titleWidth := text.VisibleWidth(options.Title)
	titleLabel := ""
	if titleWidth > 0 {
		titleLabel = " " + options.Title + " "
	}

	topBorderWidth := contentWidth - titleWidth
	if titleWidth == 0 {
		topBorderWidth += 2
	}

	renderedInfo := ""
	if options.Info != "" {
		renderedInfo = text.Truncate(options.Info, contentWidth-1)
	}

	bottomBorderWidth := contentWidth + 2
	if renderedInfo != "" {
		bottomBorderWidth = contentWidth - text.VisibleWidth(renderedInfo)
	}

	lines := []string{
		borderStyle(" ┌") + titleLabel + borderStyle(stdstrings.Repeat("─", topBorderWidth)+"┐"),
	}

	for _, line := range bodyLines {
		lines = append(lines, borderStyle(" │")+" "+padVisible(line, contentWidth)+" "+borderStyle("│"))
	}

	bottom := " └" + stdstrings.Repeat("─", bottomBorderWidth)
	if renderedInfo != "" {
		bottom += " " + renderedInfo + " "
	}
	bottom += "┘"

	lines = append(lines, borderStyle(bottom))

	return stdstrings.Join(lines, "\n")
}
