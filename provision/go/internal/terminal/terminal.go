package terminal

import (
	"io"
	"math"
	"os"
)

type Size struct {
	Columns int
	Rows    int
}

type Color [3]int

func DefaultSize() Size {
	return Size{Columns: 80, Rows: 24}
}

func ClearSequence() string {
	return "\x1b[H\x1b[J"
}

func TitleSequence(title string) string {
	return "\x1b]0;" + title + "\x07"
}

func EraseLineSequence() string {
	return "\x1b[2K"
}

func ErasePreviousLinesSequence(count int) string {
	lines := int(math.Max(0, math.Floor(float64(count))))
	result := ""
	for range lines {
		result += "\x1b[1A\x1b[2K"
	}

	return result
}

func CursorToStartSequence() string {
	return "\r"
}

func HideCursorSequence() string {
	return "\x1b[?25l"
}

func ShowCursorSequence() string {
	return "\x1b[?25h"
}

func WriteClear(writer io.Writer) error {
	_, err := io.WriteString(writer, ClearSequence())
	return err
}

func WriteTitle(writer io.Writer, title string) error {
	_, err := io.WriteString(writer, TitleSequence(title))
	return err
}

func SupportsTrueColor(value ...string) bool {
	colorTerm := os.Getenv("COLORTERM")
	if len(value) > 0 {
		colorTerm = value[0]
	}

	return colorTerm == "truecolor" || colorTerm == "24bit"
}

func DefaultForegroundColor() Color {
	return Color{204, 204, 204}
}

func DefaultBackgroundColor() Color {
	return Color{0, 0, 0}
}

func ParseColor(value []int, fallback Color) Color {
	if len(value) != 3 {
		return fallback
	}

	for _, part := range value {
		if part < 0 || part > 255 {
			return fallback
		}
	}

	return Color{value[0], value[1], value[2]}
}
