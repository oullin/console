package theme

import "fmt"

func ansi(open int, close int, value string) string {
	if value == "" {
		return ""
	}

	return fmt.Sprintf("\x1b[%dm%s\x1b[%dm", open, value, close)
}

func Dim(value string) string {
	return ansi(2, 22, value)
}

func Cyan(value string) string {
	return ansi(36, 39, value)
}

func Green(value string) string {
	return ansi(32, 39, value)
}

func Inverse(value string) string {
	return ansi(7, 27, value)
}

func Black(value string) string {
	return ansi(30, 39, value)
}

func Red(value string) string {
	return ansi(31, 39, value)
}

func Strikethrough(value string) string {
	return ansi(9, 29, value)
}

func White(value string) string {
	return ansi(37, 39, value)
}

func Yellow(value string) string {
	return ansi(33, 39, value)
}

func BackgroundCyan(value string) string {
	return ansi(46, 49, value)
}

func BackgroundRed(value string) string {
	return ansi(41, 49, value)
}

func ForegroundRGB(value string, red int, green int, blue int) string {
	if value == "" {
		return ""
	}

	return fmt.Sprintf("\x1b[38;2;%d;%d;%dm%s\x1b[0m", red, green, blue, value)
}
