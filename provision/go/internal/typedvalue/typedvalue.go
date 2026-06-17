package typedvalue

import (
	"unicode"

	"github.com/oullin/tui/internal/key"
)

type State struct {
	Cursor int
	Value  string
}

type AppliedKey struct {
	Cursor    int
	Value     string
	Cancelled bool
	Submitted bool
}

func InitialState(value string) State {
	return State{Cursor: CharacterLength(value), Value: value}
}

func ApplyKey(state State, pressed string, allowNewLine bool, wrapWidth ...int) AppliedKey {
	value := Characters(state.Value)
	cursor := clamp(state.Cursor, 0, len(value))
	width := 0
	if len(wrapWidth) > 0 {
		width = wrapWidth[0]
	}

	if pressed == key.First(key.CtrlC) {
		return result(value, cursor, true, false)
	}

	if pressed == key.First(key.CtrlD) && allowNewLine {
		return result(value, cursor, false, true)
	}

	if pressed == key.First(key.Enter) {
		if !allowNewLine {
			return result(value, cursor, false, true)
		}

		value = insertAt(value, cursor, "\n")
		return result(value, cursor+1, false, false)
	}

	if moved, ok := moveCursor(value, cursor, pressed, allowNewLine, width); ok {
		return result(value, moved, false, false)
	}

	if next, ok := deleteKey(value, cursor, pressed, allowNewLine); ok {
		return result(next.value, next.cursor, false, false)
	}

	if next, ok := insertPrintable(value, cursor, pressed); ok {
		return result(next.value, next.cursor, false, false)
	}

	return result(value, cursor, false, false)
}

func Characters(value string) []string {
	characters := make([]string, 0)
	for _, char := range value {
		characters = append(characters, string(char))
	}

	return characters
}

func FromCharacters(value []string) string {
	result := ""
	for _, char := range value {
		result += char
	}

	return result
}

func CharacterLength(value string) int {
	return len(Characters(value))
}

func IsPrintable(value string) bool {
	if value == "" {
		return false
	}

	for _, char := range value {
		if char < 32 || char == 127 {
			return false
		}
	}

	return true
}

type cursorResult struct {
	cursor int
	value  []string
}

func result(value []string, cursor int, cancelled bool, submitted bool) AppliedKey {
	return AppliedKey{
		Cancelled: cancelled,
		Cursor:    cursor,
		Submitted: submitted,
		Value:     FromCharacters(value),
	}
}

func moveCursor(value []string, cursor int, pressed string, allowNewLine bool, wrapWidth int) (int, bool) {
	switch pressed {
	case key.First(key.Left), key.First(key.LeftArrow), key.First(key.CtrlB):
		return max(0, cursor-1), true
	case key.First(key.Right), key.First(key.RightArrow), key.First(key.CtrlF):
		return min(len(value), cursor+1), true
	}

	if allowNewLine {
		switch pressed {
		case key.First(key.Up), key.First(key.UpArrow), key.First(key.CtrlP):
			return MoveLine(value, cursor, -1, wrapWidth), true
		case key.First(key.Down), key.First(key.DownArrow), key.First(key.CtrlN):
			return MoveLine(value, cursor, 1, wrapWidth), true
		}
	}

	if _, ok := key.OneOf([]key.Value{key.Home, key.CtrlA}, pressed); ok {
		if allowNewLine {
			return MoveToLineBoundary(value, cursor, "start"), true
		}
		return 0, true
	}

	if _, ok := key.OneOf([]key.Value{key.End, key.CtrlE}, pressed); ok {
		if allowNewLine {
			return MoveToLineBoundary(value, cursor, "end"), true
		}
		return len(value), true
	}

	return 0, false
}

func deleteKey(value []string, cursor int, pressed string, allowNewLine bool) (cursorResult, bool) {
	switch pressed {
	case key.First(key.Delete):
		return cursorResult{cursor: cursor, value: deleteRange(value, cursor, cursor+1)}, true
	case key.First(key.CtrlU):
		start := 0
		if allowNewLine {
			start = MoveToLineBoundary(value, cursor, "start")
		}
		return cursorResult{cursor: start, value: deleteRange(value, start, cursor)}, true
	case key.First(key.Backspace), key.First(key.CtrlH):
		if cursor == 0 {
			return cursorResult{cursor: cursor, value: value}, true
		}
		return cursorResult{cursor: cursor - 1, value: deleteRange(value, cursor-1, cursor)}, true
	case key.First(key.OptionBackspace):
		start := previousWordStart(value, cursor)
		return cursorResult{cursor: start, value: deleteRange(value, start, cursor)}, true
	default:
		return cursorResult{}, false
	}
}

func insertPrintable(value []string, cursor int, pressed string) (cursorResult, bool) {
	if !IsPrintable(pressed) {
		return cursorResult{}, false
	}

	next := append([]string{}, value...)
	nextCursor := cursor
	for _, char := range Characters(pressed) {
		next = insertAt(next, nextCursor, char)
		nextCursor++
	}

	return cursorResult{cursor: nextCursor, value: next}, true
}

func insertAt(value []string, cursor int, char string) []string {
	next := append([]string{}, value[:cursor]...)
	next = append(next, char)
	next = append(next, value[cursor:]...)
	return next
}

func deleteRange(value []string, start int, end int) []string {
	start = clamp(start, 0, len(value))
	end = clamp(end, start, len(value))
	next := append([]string{}, value[:start]...)
	next = append(next, value[end:]...)
	return next
}

func previousWordStart(value []string, cursor int) int {
	index := clamp(cursor, 0, len(value))
	for index > 0 && isSpace([]rune(value[index-1])[0]) {
		index--
	}

	if index == 0 {
		return 0
	}

	char := []rune(value[index-1])[0]
	if isWord(char) {
		for index > 0 && isWord([]rune(value[index-1])[0]) {
			index--
		}
		return index
	}

	for index > 0 {
		previous := []rune(value[index-1])[0]
		if isWord(previous) || isSpace(previous) {
			break
		}
		index--
	}

	return index
}

func isWord(char rune) bool {
	return unicode.IsLetter(char) || unicode.IsMark(char) || unicode.IsNumber(char)
}

func isSpace(char rune) bool {
	return unicode.IsSpace(char)
}

func clamp(value int, low int, high int) int {
	if value < low {
		return low
	}
	if value > high {
		return high
	}
	return value
}
