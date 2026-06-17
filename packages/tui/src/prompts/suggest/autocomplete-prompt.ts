import { runTextSuggestionPrompt } from '#tui/prompts/suggest/lifecycle';
import { readAutocompleteValue } from '#tui/prompts/suggest/read-autocomplete';
import { renderSubmittedAutocomplete } from '#tui/prompts/suggest/render-autocomplete';
import { suggestOptions } from '#tui/prompts/suggest/options';
import { isSuggestPromptLabel } from '#tui/prompts/suggest/validators/overload';
import type { SuggestOptions } from '#tui/prompts/suggest/options';
import type { MaybePromise, TextPromptOptions } from '#tui/types';

export function autocomplete(options: SuggestOptions): Promise<string>;

export function autocomplete(
	label: string,
	options?: string[] | ((query: string) => MaybePromise<string[]>),
	placeholder?: string,
	defaultValue?: string,
	required?: boolean | string,
	validate?: TextPromptOptions['validate'],
	hint?: string,
	transform?: TextPromptOptions['transform'],
	info?: SuggestOptions['info'],
): Promise<string>;

export async function autocomplete(
	message: string | SuggestOptions,
	source: string[] | ((query: string) => MaybePromise<string[]>) = [],
	placeholder = '',
	defaultValue = '',
	required: boolean | string = false,
	validate: TextPromptOptions['validate'] = undefined,
	hint = '',
	transform: TextPromptOptions['transform'] = undefined,
	info: SuggestOptions['info'] = '',
): Promise<string> {
	const options = isSuggestPromptLabel(message)
		? suggestOptions({ message, label: message, options: source, placeholder, default: defaultValue, required, validate, hint, transform, info })
		: suggestOptions(message);

	return runTextSuggestionPrompt('autocomplete', options, readAutocompleteValue, renderSubmittedAutocomplete);
}
