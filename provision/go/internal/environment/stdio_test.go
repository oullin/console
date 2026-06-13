package environment

import (
	"bytes"
	"testing"
)

func TestStdioInputReadsKeysLinesAndEscapeSequences(t *testing.T) {
	var prompt bytes.Buffer
	input := NewStdioInput(bytes.NewBufferString("A\r\x1b[Ahello\n"), &prompt)

	pressed, ok, err := input.ReadKey()
	if err != nil || !ok || pressed != "A" {
		t.Fatalf("first key = %q ok=%v err=%v", pressed, ok, err)
	}

	pressed, ok, err = input.ReadKey()
	if err != nil || !ok || pressed != "\n" {
		t.Fatalf("enter key = %q ok=%v err=%v", pressed, ok, err)
	}

	pressed, ok, err = input.ReadKey()
	if err != nil || !ok || pressed != "\x1b[A" {
		t.Fatalf("escape key = %q ok=%v err=%v", pressed, ok, err)
	}

	line, err := input.ReadLine("Name: ")
	if err != nil || line != "hello" {
		t.Fatalf("line = %q err=%v", line, err)
	}
	if prompt.String() != "Name: " {
		t.Fatalf("prompt = %q", prompt.String())
	}
}

func TestWriterOutputWritesToWriter(t *testing.T) {
	var output bytes.Buffer
	NewWriterOutput(&output).Write("hello")

	if output.String() != "hello" {
		t.Fatalf("output = %q", output.String())
	}
}
