package form

import "github.com/oullin/tui/internal/status"

func (builder *Builder) Progress(total int, message string, name ...string) *Builder {
	return builder.AddSideEffect(func() error {
		bar := status.NewProgress(total, message, "")
		bar.Start()
		bar.Finish()
		return nil
	}, name...)
}

func (builder *Builder) Spin(message string, callback func() (any, error), name ...string) *Builder {
	return builder.Add(func(*Responses, any, string) (any, error) {
		return status.Spin(message, callback)
	}, name...)
}

func (builder *Builder) Stream(name ...string) *Builder {
	return builder.Add(func(*Responses, any, string) (any, error) {
		return status.NewStream(), nil
	}, name...)
}

func (builder *Builder) Task(label string, callback func(*status.Logger) (any, error), limit int, keepSummary bool, subLabel string, name ...string) *Builder {
	return builder.Add(func(*Responses, any, string) (any, error) {
		return status.Task(label, callback, limit, keepSummary, subLabel)
	}, name...)
}
