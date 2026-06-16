import { runTextSuggestionPrompt } from '#tui/prompts/suggest/lifecycle';
import { readSuggestionValue } from '#tui/prompts/suggest/read';
import { renderSubmittedSuggestion } from '#tui/prompts/suggest/render';
import { suggestOptions } from '#tui/prompts/suggest/options';
import type { SuggestOptions } from '#tui/prompts/suggest/options';
import type { MaybePromise, TextPromptOptions } from '#tui/types';

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
	info?: SuggestOptions['info'],
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
	info: SuggestOptions['info'] = '',
): Promise<string> {
	const options = suggestOptions(message, source, placeholder, defaultValue, scroll, required, validate, hint, transform, info);

	return runTextSuggestionPrompt('suggest', options, readSuggestionValue, renderSubmittedSuggestion);
}
