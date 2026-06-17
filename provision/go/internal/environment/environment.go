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
	scopes    = map[uint64][]Environment{}
)

func Current() Environment {
	currentMu.Lock()
	defer currentMu.Unlock()

	if scoped, ok := currentScope(); ok {
		return scoped
	}

	return current
}

func Configure(patch Patch) {
	currentMu.Lock()
	defer currentMu.Unlock()

	if scoped, ok := currentScope(); ok {
		updateCurrentScope(merge(scoped, patch))

		return
	}

	current = merge(current, patch)
}

func With(patch Patch, callback func() error) error {
	currentMu.Lock()
	base := current
	if scoped, ok := currentScope(); ok {
		base = scoped
	}
	pushScope(merge(base, patch))
	currentMu.Unlock()

	defer func() {
		currentMu.Lock()
		popScope()
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
