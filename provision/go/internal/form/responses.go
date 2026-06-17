package form

type Responses struct {
	named      map[string]any
	positional []any
}

func NewResponses() *Responses {
	return &Responses{named: map[string]any{}}
}

func (responses *Responses) At(index int) any {
	if responses == nil || index < 0 || index >= len(responses.positional) {
		return nil
	}

	return responses.positional[index]
}

func (responses *Responses) Named(name string) any {
	if responses == nil || name == "" {
		return nil
	}

	return responses.named[name]
}

func (responses *Responses) Values() []any {
	if responses == nil {
		return nil
	}

	values := make([]any, len(responses.positional))
	copy(values, responses.positional)

	return values
}

func (responses *Responses) Names() map[string]any {
	if responses == nil {
		return nil
	}

	values := make(map[string]any, len(responses.named))
	for key, value := range responses.named {
		values[key] = value
	}

	return values
}

func (responses *Responses) previous(index int, name string) any {
	if name != "" {
		return responses.Named(name)
	}

	return responses.At(index)
}

func (responses *Responses) set(index int, name string, value any) {
	if name != "" {
		responses.named[name] = value
		return
	}

	for len(responses.positional) <= index {
		responses.positional = append(responses.positional, nil)
	}
	responses.positional[index] = value
}
