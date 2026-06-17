package status

import (
	"errors"
	stdstrings "strings"

	"github.com/oullin/tui/internal/environment"
	text "github.com/oullin/tui/internal/strings"
	"github.com/oullin/tui/internal/terminal"
	"github.com/oullin/tui/internal/theme"
)

type Stream struct {
	closed bool
	buffer *StreamBuffer
}

func NewStream() *Stream {
	environment.Current().Output.Write(terminal.HideCursorSequence())
	return &Stream{buffer: NewStreamBuffer(10)}
}

func (stream *Stream) Write(content string) error {
	return stream.Append(content)
}

func (stream *Stream) Append(content string) error {
	if stream.closed {
		return errors.New("stream is closed")
	}
	stream.buffer.Append(content)
	stream.render()
	return nil
}

func (stream *Stream) Close() {
	if stream.closed {
		return
	}
	for stream.buffer.FlushNext() {
		stream.render()
	}
	stream.closed = true
	environment.Current().Output.Write(terminal.ShowCursorSequence())
}

func (stream *Stream) Closed() bool {
	return stream.closed
}

func (stream *Stream) Value() string {
	return stream.buffer.Value()
}

func (stream *Stream) Lines() []string {
	return StreamLines(stream.Value(), 60)
}

func (stream *Stream) render() {
	environment.Current().Output.Write(RenderStreamFrame(stream.buffer.StableValue(), stream.buffer.Fading, StreamFadeStyles(false), 60))
}

type StreamBuffer struct {
	Fading    []string
	message   string
	fadeLimit int
}

func NewStreamBuffer(fadeLimit int) *StreamBuffer {
	return &StreamBuffer{fadeLimit: fadeLimit}
}

func (buffer *StreamBuffer) Append(message string) {
	buffer.Fading = append(buffer.Fading, message)
	for len(buffer.Fading) > buffer.fadeLimit {
		buffer.message += buffer.Fading[0]
		buffer.Fading = buffer.Fading[1:]
	}
}

func (buffer *StreamBuffer) FlushNext() bool {
	if len(buffer.Fading) == 0 {
		return false
	}
	buffer.message += buffer.Fading[0]
	buffer.Fading = buffer.Fading[1:]
	return true
}

func (buffer *StreamBuffer) Value() string {
	return buffer.message + stdstrings.Join(buffer.Fading, "")
}

func (buffer *StreamBuffer) StableValue() string {
	return buffer.message
}

type FadeStyle func(string) string

func StreamFadeStyles(trueColor bool) []FadeStyle {
	if trueColor {
		return []FadeStyle{
			func(value string) string { return theme.ForegroundRGB(value, 100, 50, 0) },
			func(value string) string { return theme.ForegroundRGB(value, 50, 25, 0) },
		}
	}
	return []FadeStyle{func(value string) string { return value }, theme.Dim}
}

func RenderStreamFrame(value string, fading []string, styles []FadeStyle, width int) string {
	rendered := value
	for index, chunk := range fading {
		style := styles[len(styles)-1]
		if index < len(styles) {
			style = styles[index]
		}
		rendered += style(chunk)
	}
	lines := StreamLines(rendered, width)
	for index, line := range lines {
		lines[index] = " " + line
	}
	return stdstrings.Join(lines, "\n") + "\n"
}

func StreamLines(value string, width int) []string {
	parts := stdstrings.Split(value, "\n")
	lines := make([]string, 0)
	for _, part := range parts {
		lines = append(lines, text.Wrap(part, width)...)
	}
	return lines
}
