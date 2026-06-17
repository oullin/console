package output

import (
	"fmt"
	"math"
	stdstrings "strings"

	"github.com/oullin/tui/internal/environment"
	text "github.com/oullin/tui/internal/strings"
	"github.com/oullin/tui/internal/theme"
)

type TableRow map[string]any

func Table(headers []string, rows [][]any) {
	renderedRows := make([][]string, len(rows))
	for rowIndex, row := range rows {
		renderedRows[rowIndex] = make([]string, len(row))
		for cellIndex, cell := range row {
			renderedRows[rowIndex][cellIndex] = stringifyCell(cell)
		}
	}

	environment.Current().Output.Write(theme.RenderTable(headers, renderedRows) + "\n")
}

func TableObjects(headers []string, rows []TableRow) {
	if len(headers) == 0 && len(rows) > 0 {
		for key := range rows[0] {
			headers = append(headers, key)
		}
	}

	renderedRows := make([][]any, len(rows))
	for rowIndex, row := range rows {
		renderedRows[rowIndex] = make([]any, len(headers))
		for headerIndex, header := range headers {
			renderedRows[rowIndex][headerIndex] = row[header]
		}
	}
	Table(headers, renderedRows)
}

func Grid(items []any, maxWidth int) {
	rendered := RenderGrid(items, maxWidth)
	if rendered == "" {
		return
	}

	environment.Current().Output.Write(rendered + "\n")
}

func RenderGrid(items []any, maxWidth int) string {
	if len(items) == 0 {
		return ""
	}

	values := make([]string, len(items))
	for index, item := range items {
		values[index] = fmt.Sprint(item)
	}

	width := maxWidth
	if width <= 0 {
		width = 1
	}
	availableWidth := width - 2
	cellWidth := 0
	for _, value := range values {
		if valueWidth := text.VisibleWidth(value) + 4; valueWidth > cellWidth {
			cellWidth = valueWidth
		}
	}
	maxColumns := int(math.Max(1, math.Floor(float64((availableWidth-1)/(cellWidth+1)))))
	columnCount := max(1, balancedColumnCount(len(values), maxColumns))
	rows := chunkItems(values, columnCount)
	widths := make([]int, columnCount)
	for column := range columnCount {
		for _, row := range rows {
			if width := text.VisibleWidth(row[column]); width > widths[column] {
				widths[column] = width
			}
		}
	}

	renderedRows := []string{horizontal("┌", "┬", "┐", widths)}
	for index, row := range rows {
		if index > 0 {
			renderedRows = append(renderedRows, horizontal("├", "┼", "┤", widths))
		}
		cells := make([]string, len(widths))
		for column, width := range widths {
			cells[column] = padVisible(row[column], width)
		}
		renderedRows = append(renderedRows, "│ "+stdstrings.Join(cells, " │ ")+" │")
	}
	renderedRows = append(renderedRows, horizontal("└", "┴", "┘", widths))

	for index, line := range renderedRows {
		renderedRows[index] = " " + line
	}

	return stdstrings.Join(renderedRows, "\n")
}

func stringifyCell(value any) string {
	if value == nil {
		return ""
	}
	return fmt.Sprint(value)
}

func padVisible(value string, width int) string {
	padding := width - text.VisibleWidth(value)
	if padding < 0 {
		padding = 0
	}
	return value + stdstrings.Repeat(" ", padding)
}

func balancedColumnCount(itemCount int, maxColumns int) int {
	if itemCount <= maxColumns {
		return itemCount
	}
	for columns := maxColumns; columns >= 1; columns-- {
		remainder := itemCount % columns
		if remainder == 0 || remainder >= int(math.Ceil(float64(columns)/2)) {
			return columns
		}
	}
	return maxColumns
}

func chunkItems(items []string, columnCount int) [][]string {
	rows := make([][]string, 0)
	for index := 0; index < len(items); index += columnCount {
		row := append([]string{}, items[index:min(index+columnCount, len(items))]...)
		for len(row) < columnCount {
			row = append(row, "")
		}
		rows = append(rows, row)
	}
	return rows
}

func horizontal(left string, middle string, right string, widths []int) string {
	parts := make([]string, len(widths))
	for index, width := range widths {
		parts[index] = stdstrings.Repeat("─", width+2)
	}
	return left + stdstrings.Join(parts, middle) + right
}
