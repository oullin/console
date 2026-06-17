package output

import (
	"errors"
	"fmt"
	stdstrings "strings"

	"github.com/oullin/tui/internal/environment"
	"github.com/oullin/tui/internal/key"
	"github.com/oullin/tui/internal/prompt"
	"github.com/oullin/tui/internal/theme"
	"github.com/oullin/tui/internal/typedvalue"
)

type DataTableRow struct {
	Cells map[string]any
	Value any
}

type DataTableOptions struct {
	Message    string
	Headers    []string
	Rows       []DataTableRow
	Default    any
	HasDefault bool
	Required   prompt.Required
	Validate   prompt.Validator[any]
	Transform  func(any) (any, error)
	Filter     func(string, DataTableRow) bool
	Scroll     int
}

func DataTable(options DataTableOptions) (any, error) {
	if options.Scroll == 0 {
		options.Scroll = 10
	}
	if len(options.Headers) == 0 {
		options.Headers = deriveHeaders(options.Rows)
	}
	defaultValue := options.Default
	if options.HasDefault && options.Transform != nil {
		transformed, err := options.Transform(defaultValue)
		if err == nil {
			defaultValue = transformed
		}
	}
	var submitted *dataTableSelection
	return prompt.UntilValid(
		prompt.Options[any]{Message: options.Message, Default: defaultValue, Required: options.Required, Validate: options.Validate},
		func(_ int) (any, error) {
			selection, err := readDataTableSelection(options)
			if err != nil {
				return nil, err
			}
			value := selection.Value
			if options.Transform != nil {
				value, err = options.Transform(value)
				if err != nil {
					return nil, err
				}
			}
			if selection.Submitted && !selection.Cancelled {
				submitted = &selection
			}
			return value, nil
		},
		func(any) error {
			if submitted != nil {
				renderSubmittedDataTableFrame(options.Message, options.Headers, submitted.Row)
			}
			return nil
		},
	)
}

type dataTableSelection struct {
	Cancelled bool
	Submitted bool
	Row       DataTableRow
	Value     any
}

func readDataTableSelection(options DataTableOptions) (dataTableSelection, error) {
	env := environment.Current()
	rows := visibleRows(options, "")
	selected := defaultDataTableIndex(rows, options.Default, options.HasDefault)
	query := ""
	mode := "browse"
	renderDataTableFrame(options, rows, selected, mode, query)

	for {
		pressed, ok, err := env.Input.ReadKey()
		if err != nil {
			if errors.Is(err, environment.ErrKeyInputUnsupported) {
				answer, lineErr := env.Input.ReadLine(theme.RenderQuestion(options.Message, ""))
				if lineErr != nil {
					return dataTableSelection{}, lineErr
				}
				rows = visibleRows(options, answer)
				if len(rows) == 0 {
					return dataTableSelection{}, prompt.ValidationError("Please select a valid option.")
				}
				return dataTableSelection{Row: rows[0], Value: dataTableRowValue(rows[0], 0)}, nil
			}
			return dataTableSelection{}, err
		}
		if !ok || pressed == key.First(key.Enter) {
			if len(rows) == 0 {
				return dataTableSelection{}, prompt.ValidationError("Please select a valid option.")
			}
			row := rows[selected]
			return dataTableSelection{Submitted: true, Row: row, Value: dataTableRowValue(row, selected)}, nil
		}
		if pressed == key.First(key.CtrlC) {
			if len(rows) == 0 {
				return dataTableSelection{}, prompt.ValidationError("Please select a valid option.")
			}
			row := rows[selected]
			renderCancelledDataTableFrame(options, rows, selected)
			return dataTableSelection{Cancelled: true, Row: row, Value: dataTableRowValue(row, selected)}, nil
		}
		if pressed == "/" {
			mode = "search"
			query = ""
			renderDataTableFrame(options, rows, selected, mode, query)
			continue
		}
		if mode == "search" {
			if pressed == key.First(key.Escape) {
				mode = "browse"
				query = ""
				rows = visibleRows(options, query)
				selected = clampSelection(selected, rows)
				renderDataTableFrame(options, rows, selected, mode, query)
				continue
			}
			next := typedvalue.ApplyKey(typedvalue.State{Cursor: typedvalue.CharacterLength(query), Value: query}, pressed, false)
			if !next.Submitted && !next.Cancelled {
				query = next.Value
				rows = visibleRows(options, query)
				selected = clampSelection(0, rows)
				renderDataTableFrame(options, rows, selected, mode, query)
				continue
			}
		}
		if direction, ok := dataTableNavigation(pressed); ok {
			selected = clampSelection(selected+direction, rows)
			renderDataTableFrame(options, rows, selected, mode, query)
			continue
		}
	}
}

func renderDataTableFrame(options DataTableOptions, rows []DataTableRow, selected int, mode string, query string) {
	title := options.Message
	if mode == "search" || query != "" {
		title += " " + query
	}
	if len(rows) == 0 {
		environment.Current().Output.Write(title + "\n" + theme.RenderTable(nil, [][]string{{"No results found."}}) + "\n")
		return
	}
	windowStart := 0
	windowEnd := len(rows)
	if options.Scroll > 0 && options.Scroll < len(rows) {
		windowStart = selected - (options.Scroll-1)/2
		if windowStart < 0 {
			windowStart = 0
		}
		if windowStart+options.Scroll > len(rows) {
			windowStart = len(rows) - options.Scroll
		}
		windowEnd = windowStart + options.Scroll
	}
	rendered := make([][]string, windowEnd-windowStart)
	for index := windowStart; index < windowEnd; index++ {
		pointer := " "
		if index == selected {
			pointer = "›"
		}
		rendered[index-windowStart] = append([]string{pointer}, dataTableRowCells(options.Headers, rows[index])...)
	}
	headers := append([]string{""}, options.Headers...)
	environment.Current().Output.Write(title + "\n" + theme.RenderTable(headers, rendered) + "\n")
}

func renderSubmittedDataTableFrame(message string, headers []string, row DataTableRow) {
	environment.Current().Output.Write(message + "\n" + stdstrings.Join(dataTableRowCells(headers, row), ", ") + "\n")
}

func renderCancelledDataTableFrame(options DataTableOptions, rows []DataTableRow, selected int) {
	rendered := make([][]string, len(rows))
	for index, row := range rows {
		pointer := " "
		if index == selected {
			pointer = "›"
		}
		cells := dataTableRowCells(options.Headers, row)
		for cellIndex, cell := range cells {
			cells[cellIndex] = theme.Strikethrough(theme.Dim(cell))
		}
		rendered[index] = append([]string{pointer}, cells...)
	}
	env := environment.Current()
	env.Output.Write(options.Message + "\n")
	env.Output.Write(theme.Dim("/ Search") + "\n")
	env.Output.Write(theme.RenderTable(append([]string{""}, options.Headers...), rendered) + "\n")
	env.ErrorOutput.Write(theme.Red("  ⚠ Cancelled.") + "\n")
}

func visibleRows(options DataTableOptions, query string) []DataTableRow {
	rows := make([]DataTableRow, 0, len(options.Rows))
	for _, row := range options.Rows {
		if query == "" {
			rows = append(rows, row)
			continue
		}
		if options.Filter != nil {
			if options.Filter(query, row) {
				rows = append(rows, row)
			}
			continue
		}
		if stdstrings.Contains(stdstrings.ToLower(stdstrings.Join(dataTableRowCells(options.Headers, row), " ")), stdstrings.ToLower(query)) {
			rows = append(rows, row)
		}
	}
	return rows
}

func deriveHeaders(rows []DataTableRow) []string {
	if len(rows) == 0 {
		return nil
	}
	headers := make([]string, 0, len(rows[0].Cells))
	for key := range rows[0].Cells {
		if key != "value" {
			headers = append(headers, key)
		}
	}
	return headers
}

func dataTableRowCells(headers []string, row DataTableRow) []string {
	if len(headers) == 0 {
		cells := make([]string, 0, len(row.Cells))
		for _, value := range row.Cells {
			cells = append(cells, stringifyCell(value))
		}
		return cells
	}
	cells := make([]string, len(headers))
	for index, header := range headers {
		cells[index] = stringifyCell(row.Cells[header])
	}
	return cells
}

func dataTableRowValue(row DataTableRow, index int) any {
	if row.Value != nil {
		return row.Value
	}
	return index
}

func defaultDataTableIndex(rows []DataTableRow, value any, hasDefault bool) int {
	if !hasDefault {
		return 0
	}
	for index, row := range rows {
		if fmt.Sprint(dataTableRowValue(row, index)) == fmt.Sprint(value) {
			return index
		}
	}
	return 0
}

func dataTableNavigation(pressed string) (int, bool) {
	switch pressed {
	case key.First(key.Down), key.First(key.DownArrow), key.First(key.CtrlN):
		return 1, true
	case key.First(key.Up), key.First(key.UpArrow), key.First(key.CtrlP):
		return -1, true
	default:
		return 0, false
	}
}

func clampSelection(selected int, rows []DataTableRow) int {
	if len(rows) == 0 {
		return 0
	}
	if selected < 0 {
		return 0
	}
	if selected >= len(rows) {
		return len(rows) - 1
	}
	return selected
}
