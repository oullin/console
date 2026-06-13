package form

import "github.com/oullin/tui/internal/output"

func (builder *Builder) Alert(message string, name ...string) *Builder {
	return builder.AddSideEffect(func() error {
		output.Alert(message)
		return nil
	}, name...)
}

func (builder *Builder) Clear(name ...string) *Builder {
	return builder.AddSideEffect(func() error {
		output.Clear()
		return nil
	}, name...)
}

func (builder *Builder) Error(message string, name ...string) *Builder {
	return builder.AddSideEffect(func() error {
		output.Error(message)
		return nil
	}, name...)
}

func (builder *Builder) Grid(items []any, maxWidth int, name ...string) *Builder {
	return builder.AddSideEffect(func() error {
		output.Grid(items, maxWidth)
		return nil
	}, name...)
}

func (builder *Builder) Info(message string, name ...string) *Builder {
	return builder.AddSideEffect(func() error {
		output.Info(message)
		return nil
	}, name...)
}

func (builder *Builder) Intro(message string, name ...string) *Builder {
	return builder.AddSideEffect(func() error {
		output.Intro(message)
		return nil
	}, name...)
}

func (builder *Builder) Note(message string, noteType output.NoteType, name ...string) *Builder {
	return builder.AddSideEffect(func() error {
		output.Note(message, noteType)
		return nil
	}, name...)
}

func (builder *Builder) Outro(message string, name ...string) *Builder {
	return builder.AddSideEffect(func() error {
		output.Outro(message)
		return nil
	}, name...)
}

func (builder *Builder) Table(headers []string, rows [][]any, name ...string) *Builder {
	return builder.AddSideEffect(func() error {
		output.Table(headers, rows)
		return nil
	}, name...)
}

func (builder *Builder) TableObjects(headers []string, rows []output.TableRow, name ...string) *Builder {
	return builder.AddSideEffect(func() error {
		output.TableObjects(headers, rows)
		return nil
	}, name...)
}

func (builder *Builder) Title(value string, name ...string) *Builder {
	return builder.AddSideEffect(func() error {
		output.Title(value)
		return nil
	}, name...)
}

func (builder *Builder) Warning(message string, name ...string) *Builder {
	return builder.AddSideEffect(func() error {
		output.Warning(message)
		return nil
	}, name...)
}
