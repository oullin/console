package environment

import "sync"

type MemoryOutput struct {
	mu     sync.Mutex
	buffer string
}

func NewMemoryOutput() *MemoryOutput {
	return &MemoryOutput{}
}

func (output *MemoryOutput) Write(content string) {
	output.mu.Lock()
	defer output.mu.Unlock()

	output.buffer += content
}

func (output *MemoryOutput) Clear() {
	output.mu.Lock()
	defer output.mu.Unlock()

	output.buffer = ""
}

func (output *MemoryOutput) Text() string {
	output.mu.Lock()
	defer output.mu.Unlock()

	return output.buffer
}
