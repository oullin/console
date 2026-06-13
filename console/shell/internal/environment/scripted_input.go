package environment

type ScriptedInput struct {
	queued []string
}

func NewScriptedInput(lines []string) *ScriptedInput {
	queued := make([]string, len(lines))
	copy(queued, lines)

	return &ScriptedInput{queued: queued}
}

func (input *ScriptedInput) ReadKey() (string, bool, error) {
	if len(input.queued) == 0 {
		return "", false, nil
	}

	value := input.queued[0]
	input.queued = input.queued[1:]

	return value, true, nil
}

func (input *ScriptedInput) ReadLine(_ string) (string, error) {
	if len(input.queued) == 0 {
		return "", nil
	}

	value := input.queued[0]
	input.queued = input.queued[1:]

	return value, nil
}
