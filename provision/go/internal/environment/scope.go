package environment

import (
	"runtime"
	"strconv"
	"strings"
)

func currentScope() (Environment, bool) {
	id, ok := currentScopeID()
	if !ok {
		return Environment{}, false
	}

	stack := scopes[id]
	if len(stack) == 0 {
		return Environment{}, false
	}

	return stack[len(stack)-1], true
}

func updateCurrentScope(environment Environment) {
	id, ok := currentScopeID()
	if !ok {
		return
	}

	stack := scopes[id]
	if len(stack) == 0 {
		return
	}

	stack[len(stack)-1] = environment
	scopes[id] = stack
}

func pushScope(environment Environment) {
	id, ok := currentScopeID()
	if !ok {
		current = environment

		return
	}

	scopes[id] = append(scopes[id], environment)
}

func popScope() {
	id, ok := currentScopeID()
	if !ok {
		return
	}

	stack := scopes[id]
	if len(stack) <= 1 {
		delete(scopes, id)

		return
	}

	scopes[id] = stack[:len(stack)-1]
}

func currentScopeID() (uint64, bool) {
	var buffer [64]byte
	size := runtime.Stack(buffer[:], false)
	line := string(buffer[:size])
	id, _, ok := strings.Cut(strings.TrimPrefix(line, "goroutine "), " ")
	if !ok {
		return 0, false
	}

	parsed, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		return 0, false
	}

	return parsed, true
}
