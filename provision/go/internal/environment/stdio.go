package environment

import (
	"bufio"
	"errors"
	"io"
	stdstrings "strings"
)

type StdioInput struct {
	prompt io.Writer
	reader *bufio.Reader
}

type WriterOutput struct {
	writer io.Writer
}

func NewStdioInput(reader io.Reader, prompt io.Writer) *StdioInput {
	return &StdioInput{prompt: prompt, reader: bufio.NewReader(reader)}
}

func NewWriterOutput(writer io.Writer) WriterOutput {
	return WriterOutput{writer: writer}
}

func (input *StdioInput) ReadKey() (string, bool, error) {
	value, err := input.reader.ReadByte()
	if errors.Is(err, io.EOF) {
		return "", false, nil
	}
	if err != nil {
		return "", false, err
	}

	if value == '\r' {
		return "\n", true, nil
	}

	if value == '\x1b' {
		return input.readEscapeSequence(value), true, nil
	}

	return string(value), true, nil
}

func (input *StdioInput) ReadLine(message string) (string, error) {
	if input.prompt != nil && message != "" {
		if _, err := io.WriteString(input.prompt, message); err != nil {
			return "", err
		}
	}

	value, err := input.reader.ReadString('\n')
	if err != nil && !errors.Is(err, io.EOF) {
		return "", err
	}

	return stdstrings.TrimRight(value, "\r\n"), nil
}

func (input *StdioInput) readEscapeSequence(first byte) string {
	sequence := []byte{first}

	for input.reader.Buffered() > 0 {
		next, err := input.reader.ReadByte()
		if err != nil {
			break
		}
		sequence = append(sequence, next)
		if isEscapeSequenceFinal(next) {
			break
		}
	}

	return string(sequence)
}

func isEscapeSequenceFinal(value byte) bool {
	return (value >= 'A' && value <= 'Z') || (value >= 'a' && value <= 'z') || value == '~'
}

func (output WriterOutput) Write(content string) {
	if output.writer == nil || content == "" {
		return
	}

	_, _ = io.WriteString(output.writer, content)
}
