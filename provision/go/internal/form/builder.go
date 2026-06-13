package form

import "errors"

type StepFunc func(responses *Responses, previous any, name string) (any, error)
type ConditionFunc func(responses *Responses) (bool, error)

type Step struct {
	Condition           ConditionFunc
	IgnoreWhenReverting bool
	Name                string
	Run                 StepFunc
}

type Builder struct {
	responses *Responses
	steps     []Step
}

func New() *Builder {
	return &Builder{responses: NewResponses()}
}

func (builder *Builder) Add(run StepFunc, name ...string) *Builder {
	return builder.addStep(trueCondition, run, firstName(name), false)
}

func (builder *Builder) AddSideEffect(run func() error, name ...string) *Builder {
	return builder.addStep(trueCondition, SideEffect(run), firstName(name), true)
}

func (builder *Builder) AddIf(condition ConditionFunc, run StepFunc, name ...string) *Builder {
	return builder.addStep(condition, run, firstName(name), false)
}

func (builder *Builder) AddSideEffectIf(condition ConditionFunc, run func() error, name ...string) *Builder {
	return builder.addStep(condition, SideEffect(run), firstName(name), true)
}

func (builder *Builder) Submit() (*Responses, error) {
	index := 0
	wasReverted := false

	for index < len(builder.steps) {
		step := builder.steps[index]

		if wasReverted && index > 0 {
			ignore, err := shouldIgnoreWhenReverting(step, builder.responses)
			if err != nil {
				return nil, err
			}
			if ignore {
				index--
				continue
			}
		}

		wasReverted = false
		shouldRun, err := shouldRun(step, builder.responses)
		if err != nil {
			return nil, err
		}
		if !shouldRun {
			builder.responses.set(index, step.Name, nil)
			index++
			continue
		}

		previous := builder.responses.previous(index, step.Name)
		value, err := runWithRevert(index > 0, func() (any, error) {
			return step.Run(builder.responses, previous, step.Name)
		})
		if err != nil {
			if !errors.Is(err, ErrReverted) {
				return nil, err
			}
			wasReverted = true
		} else {
			builder.responses.set(index, step.Name, value)
		}

		if wasReverted {
			index--
		} else {
			index++
		}
	}

	return builder.responses, nil
}

func (builder *Builder) addStep(condition ConditionFunc, run StepFunc, name string, ignoreWhenReverting bool) *Builder {
	if condition == nil {
		condition = trueCondition
	}
	builder.steps = append(builder.steps, Step{
		Condition:           condition,
		IgnoreWhenReverting: ignoreWhenReverting,
		Name:                name,
		Run:                 run,
	})
	return builder
}

func SideEffect(callback func() error) StepFunc {
	return func(*Responses, any, string) (any, error) {
		if callback == nil {
			return nil, nil
		}

		return nil, callback()
	}
}

func Bool(condition bool) ConditionFunc {
	return func(*Responses) (bool, error) {
		return condition, nil
	}
}

func trueCondition(*Responses) (bool, error) {
	return true, nil
}

func shouldRun(step Step, responses *Responses) (bool, error) {
	if step.Condition == nil {
		return true, nil
	}

	return step.Condition(responses)
}

func shouldIgnoreWhenReverting(step Step, responses *Responses) (bool, error) {
	run, err := shouldRun(step, responses)
	if err != nil || !run {
		return true, err
	}

	return step.IgnoreWhenReverting, nil
}

func firstName(values []string) string {
	if len(values) == 0 {
		return ""
	}

	return values[0]
}
