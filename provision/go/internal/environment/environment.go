package environment

import "sync"

type Output interface {
	Write(content string)
}

type Input interface {
	ReadKey() (string, bool, error)
	ReadLine(message string) (string, error)
}

type Environment struct {
	Input       Input
	Output      Output
	ErrorOutput Output
	Interactive bool
}

type Patch struct {
	Input       Input
	Output      Output
	ErrorOutput Output
	Interactive *bool
}

var (
	current = Environment{
		Input:       NewScriptedInput(nil),
		Output:      NewMemoryOutput(),
		ErrorOutput: NewMemoryOutput(),
		Interactive: false,
	}
	currentMu sync.Mutex
)

func Current() Environment {
	currentMu.Lock()
	defer currentMu.Unlock()

	return current
}

func Configure(patch Patch) {
	currentMu.Lock()
	defer currentMu.Unlock()

	current = merge(current, patch)
}

func With(patch Patch, callback func() error) error {
	currentMu.Lock()
	previous := current
	current = merge(current, patch)
	currentMu.Unlock()

	defer func() {
		currentMu.Lock()
		current = previous
		currentMu.Unlock()
	}()

	return callback()
}

func merge(environment Environment, patch Patch) Environment {
	if patch.Input != nil {
		environment.Input = patch.Input
	}
	if patch.Output != nil {
		environment.Output = patch.Output
	}
	if patch.ErrorOutput != nil {
		environment.ErrorOutput = patch.ErrorOutput
	}
	if patch.Interactive != nil {
		environment.Interactive = *patch.Interactive
	}

	return environment
}
