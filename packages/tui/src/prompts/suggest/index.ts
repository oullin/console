import { promptUntilValid } from '#tui/prompt';
import { readSuggestionValue } from '#tui/prompts/suggest/read';
import { suggestOptions } from '#tui/prompts/suggest/options';
import type { SuggestOptions } from '#tui/prompts/suggest/options';
import type { MaybePromise, TextPromptOptions } from '#tui/types';

export type { SuggestOptions } from '#tui/prompts/suggest/options';

export function suggest(options: SuggestOptions): Promise<string>;

export function suggest(
	label: string,
	options: string[] | ((query: string) => MaybePromise<string[]>),
	placeholder?: string,
	defaultValue?: string,
	scroll?: number,
	required?: boolean | string,
	validate?: TextPromptOptions['validate'],
	hint?: string,
	transform?: TextPromptOptions['transform'],
): Promise<string>;

export async function suggest(
	message: string | SuggestOptions,
	source: string[] | ((query: string) => MaybePromise<string[]>) = [],
	placeholder = '',
	defaultValue = '',
	scroll = 5,
	required: boolean | string = false,
	validate: TextPromptOptions['validate'] = undefined,
	hint = '',
	transform: TextPromptOptions['transform'] = undefined,
): Promise<string> {
	const options = suggestOptions(message, source, placeholder, defaultValue, scroll, required, validate, hint, transform);

	return promptUntilValid(options, async () => {
		const answer = await readSuggestionValue(options);

		const value = answer === '' && options.default !== undefined ? options.default : answer;

		return options.transform ? options.transform(value) : value;
	});
}

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
): Promise<string> {
	return suggest(typeof message === 'string' ? { message, label: message, options: source, placeholder, default: defaultValue, required, validate, hint, transform } : message);
}
