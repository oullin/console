package output

import (
	stdstrings "strings"

	"github.com/oullin/tui/internal/environment"
	"github.com/oullin/tui/internal/strings"
	"github.com/oullin/tui/internal/theme"
)

type NoteType string

const (
	NoteAlert   NoteType = "alert"
	NoteError   NoteType = "error"
	NoteInfo    NoteType = "info"
	NoteIntro   NoteType = "intro"
	NoteOutro   NoteType = "outro"
	NoteWarning NoteType = "warning"
)

func Note(message string, noteType NoteType) {
	environment.Current().Output.Write(stdstrings.Join(renderNoteLines(message, noteType), "\n") + "\n")
}

func Error(message string) {
	Note(message, NoteError)
}

func Warning(message string) {
	Note(message, NoteWarning)
}

func Alert(message string) {
	Note(message, NoteAlert)
}

func Info(message string) {
	Note(message, NoteInfo)
}

func Intro(message string) {
	Note(message, NoteIntro)
}

func Outro(message string) {
	Note(message, NoteOutro)
}

func renderNoteLines(message string, noteType NoteType) []string {
	lines := stdstrings.Split(message, "\n")
	if noteType == NoteIntro || noteType == NoteOutro {
		lines = paddedIntroLines(lines)
	}

	for index, line := range lines {
		lines[index] = renderNoteLine(line, noteType)
	}

	return lines
}

func paddedIntroLines(lines []string) []string {
	padded := make([]string, len(lines))
	longest := 0
	for index, line := range lines {
		padded[index] = " " + line + " "
		if width := strings.VisibleWidth(padded[index]); width > longest {
			longest = width
		}
	}
	for index, line := range padded {
		padding := longest - strings.VisibleWidth(line)
		if padding > 0 {
			padded[index] = line + stdstrings.Repeat(" ", padding)
		}
	}
	return padded
}

func renderNoteLine(line string, noteType NoteType) string {
	switch noteType {
	case NoteIntro, NoteOutro:
		return " " + theme.BackgroundCyan(theme.Black(line))
	case NoteWarning:
		return theme.Yellow(" " + line)
	case NoteError:
		return theme.Red(" " + line)
	case NoteAlert:
		return " " + theme.BackgroundRed(theme.White(" "+line+" "))
	case NoteInfo:
		return theme.Green(" " + line)
	default:
		return " " + line
	}
}
