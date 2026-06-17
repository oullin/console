package form

import (
	"github.com/oullin/tui/internal/output"
	"github.com/oullin/tui/internal/prompt"
	"github.com/oullin/tui/internal/prompts"
)

func (builder *Builder) Text(options prompts.TextOptions, name ...string) *Builder {
	return builder.Add(func(_ *Responses, previous any, _ string) (any, error) {
		options.Default = PreviousString(previous, options.Default)
		return prompts.Text(options)
	}, name...)
}

func (builder *Builder) Textarea(options prompts.TextOptions, name ...string) *Builder {
	return builder.Add(func(_ *Responses, previous any, _ string) (any, error) {
		options.Default = PreviousString(previous, options.Default)
		return prompts.Textarea(options)
	}, name...)
}

func (builder *Builder) Password(options prompts.TextOptions, name ...string) *Builder {
	return builder.Add(func(_ *Responses, previous any, _ string) (any, error) {
		options.Default = PreviousString(previous, options.Default)
		return prompts.Password(options)
	}, name...)
}

func (builder *Builder) Number(options prompts.NumberOptions, name ...string) *Builder {
	return builder.Add(func(_ *Responses, previous any, _ string) (any, error) {
		previousValue := PreviousNumber(previous, options.Default)
		options.Default = previousValue
		options.HasDefault = options.HasDefault || previousValue != ""
		return prompts.Number(options)
	}, name...)
}

func (builder *Builder) Pause(message string, name ...string) *Builder {
	return builder.Add(func(*Responses, any, string) (any, error) {
		return prompts.Pause(message)
	}, name...)
}

func (builder *Builder) Confirm(options prompts.ConfirmOptions, name ...string) *Builder {
	return builder.Add(func(_ *Responses, previous any, _ string) (any, error) {
		if previous != nil {
			options.Default = PreviousBool(previous, options.Default)
		} else if !options.HasDefault {
			options.Default = true
		}
		options.HasDefault = true
		return prompts.Confirm(options)
	}, name...)
}

func (builder *Builder) Select(options prompts.ChoiceOptions, name ...string) *Builder {
	return builder.Add(func(_ *Responses, previous any, _ string) (any, error) {
		options.Default = PreviousValue(previous, options.Default)
		options.HasDefault = options.HasDefault || previous != nil
		return prompts.Select(options)
	}, name...)
}

func (builder *Builder) Multiselect(options prompts.MultiChoiceOptions, name ...string) *Builder {
	return builder.Add(func(_ *Responses, previous any, _ string) (any, error) {
		options.Defaults = PreviousSlice(previous, options.Defaults)
		return prompts.Multiselect(options)
	}, name...)
}

func (builder *Builder) Search(options prompts.SearchOptions, name ...string) *Builder {
	return builder.Add(func(_ *Responses, previous any, _ string) (any, error) {
		options.Default = PreviousValue(previous, options.Default)
		options.HasDefault = options.HasDefault || previous != nil
		return prompts.Search(options)
	}, name...)
}

func (builder *Builder) Multisearch(options prompts.MultiSearchOptions, name ...string) *Builder {
	return builder.Add(func(_ *Responses, previous any, _ string) (any, error) {
		options.Defaults = PreviousSlice(previous, options.Defaults)
		return prompts.MultiSearch(options)
	}, name...)
}

func (builder *Builder) Suggest(options prompts.SuggestOptions, name ...string) *Builder {
	return builder.Add(func(_ *Responses, previous any, _ string) (any, error) {
		options.Default = PreviousString(previous, options.Default)
		return prompts.Suggest(options)
	}, name...)
}

func (builder *Builder) Autocomplete(options prompts.SuggestOptions, name ...string) *Builder {
	return builder.Add(func(_ *Responses, previous any, _ string) (any, error) {
		options.Default = PreviousString(previous, options.Default)
		return prompts.Autocomplete(options)
	}, name...)
}

func (builder *Builder) DataTable(options output.DataTableOptions, name ...string) *Builder {
	return builder.Add(func(_ *Responses, previous any, _ string) (any, error) {
		options.Default = PreviousValue(previous, options.Default)
		options.HasDefault = options.HasDefault || previous != nil
		return output.DataTable(options)
	}, name...)
}

func Required(value bool) prompt.Required {
	return prompt.Required{Enabled: value}
}
