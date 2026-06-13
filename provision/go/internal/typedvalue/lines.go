package typedvalue

import text "github.com/oullin/tui/internal/strings"

type LineRange struct {
	Start int
	End   int
}

type VisibleLineWindow struct {
	Lines []string
	Start int
	Total int
}

func VisibleLines(value string, cursor int, rows int) string {
	lines := VisibleLineWindowFor(value, cursor, rows).Lines
	result := ""
	for index, line := range lines {
		if index > 0 {
			result += "\n"
		}
		result += line
	}

	return result
}

func VisibleLineWindowFor(value string, cursor int, rows int, width ...int) VisibleLineWindow {
	valueCharacters := Characters(value)
	wrapWidth := 0
	if len(width) > 0 {
		wrapWidth = width[0]
	}
	ranges := lineRanges(valueCharacters, wrapWidth)

	if rows <= 0 {
		return VisibleLineWindow{
			Lines: linesForRanges(valueCharacters, ranges),
			Start: 0,
			Total: len(ranges),
		}
	}

	line := currentLine(ranges, cursor)
	start := max(0, line-rows+1)
	end := start + rows
	if end > len(ranges) {
		end = len(ranges)
	}

	return VisibleLineWindow{
		Lines: linesForRanges(valueCharacters, ranges[start:end]),
		Start: start,
		Total: len(ranges),
	}
}

func MoveLine(value []string, cursor int, direction int, width int) int {
	ranges := lineRanges(value, width)
	index := currentLine(ranges, cursor)
	if index < 0 || index >= len(ranges) {
		return cursor
	}

	targetIndex := index + direction
	if targetIndex < 0 {
		return 0
	}
	if targetIndex >= len(ranges) {
		return len(value)
	}

	current := ranges[index]
	target := ranges[targetIndex]
	column := min(cursor-current.Start, current.End-current.Start)
	targetColumn := min(column, target.End-target.Start)

	return target.Start + targetColumn
}

func MoveToLineBoundary(value []string, cursor int, boundary string) int {
	ranges := lineRanges(value, 0)
	index := currentLine(ranges, cursor)
	if index < 0 || index >= len(ranges) {
		return cursor
	}

	if boundary == "start" {
		return ranges[index].Start
	}

	return ranges[index].End
}

func lineRanges(value []string, width int) []LineRange {
	ranges := make([]LineRange, 0)
	start := 0

	for index, char := range value {
		if char == "\n" {
			ranges = append(ranges, wrappedRanges(value, start, index, width)...)
			start = index + 1
		}
	}

	ranges = append(ranges, wrappedRanges(value, start, len(value), width)...)

	return ranges
}

func wrappedRanges(value []string, start int, end int, width int) []LineRange {
	if width <= 0 || start == end {
		return []LineRange{{Start: start, End: end}}
	}

	ranges := make([]LineRange, 0)
	rangeStart := start
	rangeWidth := 0

	for index := start; index < end; index++ {
		characterWidth := text.VisibleWidth(value[index])
		if rangeWidth > 0 && rangeWidth+characterWidth > width {
			ranges = append(ranges, LineRange{Start: rangeStart, End: index})
			rangeStart = index
			rangeWidth = 0
		}

		rangeWidth += characterWidth
	}

	ranges = append(ranges, LineRange{Start: rangeStart, End: end})

	return ranges
}

func currentLine(ranges []LineRange, cursor int) int {
	for index, lineRange := range ranges {
		if cursor <= lineRange.End {
			return index
		}
	}

	return len(ranges) - 1
}

func linesForRanges(value []string, ranges []LineRange) []string {
	lines := make([]string, len(ranges))
	for index, lineRange := range ranges {
		lines[index] = FromCharacters(value[lineRange.Start:lineRange.End])
	}

	return lines
}

func min(left int, right int) int {
	if left < right {
		return left
	}
	return right
}

func max(left int, right int) int {
	if left > right {
		return left
	}
	return right
}
