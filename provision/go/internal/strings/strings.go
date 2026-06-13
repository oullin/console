package strings

import (
	stdstrings "strings"
	"unicode/utf8"

	"github.com/mattn/go-runewidth"
)

const esc = "\x1b"

type AnsiSegment struct {
	Codes string
	Text  string
}

var resetCodes = map[string]bool{
	"0":  true,
	"22": true,
	"23": true,
	"24": true,
	"27": true,
	"29": true,
	"39": true,
	"49": true,
}

func VisibleWidth(value string) int {
	return runewidth.StringWidth(ParseAnsiText(value))
}

func Truncate(value string, width int, marker ...string) string {
	suffix := "..."
	if len(marker) > 0 {
		suffix = marker[0]
	}

	if width <= 0 {
		return ""
	}

	if VisibleWidth(value) <= width {
		return value
	}

	if width <= VisibleWidth(suffix) {
		clipped := ""
		for _, char := range suffix {
			next := clipped + string(char)
			if VisibleWidth(next) > width {
				break
			}
			clipped = next
		}

		return clipped
	}

	result := ""
	activeCodes := ""
	markerWidth := VisibleWidth(suffix)

	for _, segment := range ParseAnsiSegments(value) {
		if segment.Codes != activeCodes {
			if activeCodes != "" {
				result += ansiCloseSequence(activeCodes)
			}
			if segment.Codes != "" {
				result += segment.Codes
			}
			activeCodes = segment.Codes
		}

		for _, char := range segment.Text {
			if VisibleWidth(result+string(char))+markerWidth > width {
				if activeCodes != "" {
					result += ansiCloseSequence(activeCodes)
				}

				return result + suffix
			}

			result += string(char)
		}
	}

	return result
}

func ParseAnsiSegments(value string) []AnsiSegment {
	segments := make([]AnsiSegment, 0)
	currentCodes := ""
	currentText := ""

	for index := 0; index < len(value); {
		if value[index] == '\x1b' && index+1 < len(value) && value[index+1] == '[' {
			if currentText != "" {
				segments = append(segments, AnsiSegment{Codes: currentCodes, Text: currentText})
				currentText = ""
			}

			start := index
			index += 2
			for index < len(value) && value[index] != 'm' {
				index++
			}

			if index < len(value) && value[index] == 'm' {
				index++
				sequence := value[start:index]
				code := sequence[2 : len(sequence)-1]
				if resetCodes[code] {
					currentCodes = ""
				} else {
					currentCodes = sequence
				}
				continue
			}

			currentText += value[start:]
			break
		}

		runeValue, size := utf8.DecodeRuneInString(value[index:])
		currentText += string(runeValue)
		index += size
	}

	if currentText != "" {
		segments = append(segments, AnsiSegment{Codes: currentCodes, Text: currentText})
	}

	return segments
}

func ParseAnsiText(value string) string {
	var builder stdstrings.Builder

	for _, segment := range ParseAnsiSegments(value) {
		builder.WriteString(segment.Text)
	}

	return builder.String()
}

func Wrap(value string, width int) []string {
	plainLines := plainWrap(ParseAnsiText(value), width)
	characters := codedCharacters(value)
	result := make([]string, 0, len(plainLines))
	characterIndex := 0

	for _, plainLine := range plainLines {
		line := ""
		activeCodes := ""

		for _, plainCharacter := range plainLine {
			for characterIndex < len(characters) && characters[characterIndex].Text != string(plainCharacter) {
				if characters[characterIndex].Text == " " {
					characterIndex++
					continue
				}

				break
			}

			if characterIndex >= len(characters) {
				line += string(plainCharacter)
				continue
			}

			character := characters[characterIndex]
			if character.Codes != activeCodes {
				if activeCodes != "" {
					line += "\x1b[0m"
				}
				if character.Codes != "" {
					line += character.Codes
				}
				activeCodes = character.Codes
			}

			line += string(plainCharacter)
			characterIndex++
		}

		if activeCodes != "" {
			line += ansiCloseSequence(activeCodes)
		}

		result = append(result, line)
	}

	return result
}

func ansiCloseSequence(codes string) string {
	code := codes[2 : len(codes)-1]

	switch code {
	case "1", "2":
		return esc + "[22m"
	case "3":
		return esc + "[23m"
	case "4":
		return esc + "[24m"
	case "7":
		return esc + "[27m"
	case "9":
		return esc + "[29m"
	default:
		return esc + "[0m"
	}
}

func codedCharacters(value string) []AnsiSegment {
	characters := make([]AnsiSegment, 0)

	for _, segment := range ParseAnsiSegments(value) {
		for _, char := range segment.Text {
			characters = append(characters, AnsiSegment{Codes: segment.Codes, Text: string(char)})
		}
	}

	return characters
}

func plainWrap(value string, width int) []string {
	if width <= 0 {
		return []string{value}
	}

	lines := make([]string, 0)
	for _, originalLine := range stdstrings.Split(value, "\n") {
		line := ""

		for _, word := range splitWhitespace(originalLine) {
			if VisibleWidth(line+word) <= width {
				line += word
				continue
			}

			if line != "" {
				lines = append(lines, stdstrings.TrimRight(line, " \t\r\n"))
				line = ""
			}

			if VisibleWidth(word) > width {
				chunk := ""
				for _, char := range word {
					next := chunk + string(char)
					if VisibleWidth(next) > width {
						if chunk != "" {
							lines = append(lines, chunk)
						}
						chunk = ""
					}
					chunk += string(char)
				}
				line = chunk
				continue
			}

			line = stdstrings.TrimLeft(word, " \t\r\n")
		}

		lines = append(lines, stdstrings.TrimRight(line, " \t\r\n"))
	}

	return lines
}

func splitWhitespace(value string) []string {
	if value == "" {
		return []string{""}
	}

	parts := make([]string, 0)
	current := ""
	currentWhitespace := isWhitespace(rune(value[0]))

	for _, char := range value {
		whitespace := isWhitespace(char)
		if current != "" && whitespace != currentWhitespace {
			parts = append(parts, current)
			current = ""
		}
		current += string(char)
		currentWhitespace = whitespace
	}

	if current != "" {
		parts = append(parts, current)
	}

	return parts
}

func isWhitespace(char rune) bool {
	return char == ' ' || char == '\t' || char == '\n' || char == '\r'
}
