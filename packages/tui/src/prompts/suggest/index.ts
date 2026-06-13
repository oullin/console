import { promptUntilValid, promptWithFallback } from '#tui/prompt';
import { eraseRenderedFrame } from '#tui/status/frame';
import { readAutocompleteValue } from '#tui/prompts/suggest/read-autocomplete';
import { readSuggestionValue } from '#tui/prompts/suggest/read';
import { renderSubmittedAutocomplete } from '#tui/prompts/suggest/render-autocomplete';
import { renderSubmittedSuggestion } from '#tui/prompts/suggest/render';
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

	let shouldRenderSubmittedFrame = false;
	let activeFrame: string | undefined;

	return promptWithFallback('suggest', options, () =>
		promptUntilValid(
			options,
			async () => {
				const answer = await readSuggestionValue(options);

				const value = answer.value === '' && options.default !== undefined ? options.default : answer.value;

				activeFrame = answer.frame;
				shouldRenderSubmittedFrame = answer.rendered && !answer.cancelled;

				return options.transform ? options.transform(value) : value;
			},
			(value) => {
				if (shouldRenderSubmittedFrame) {
					if (activeFrame) {
						eraseRenderedFrame(activeFrame);
					}

					renderSubmittedSuggestion(options.message, value);
				}
			},
		),
	);
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
	const options =
		typeof message === 'string'
			? suggestOptions({ message, label: message, options: source, placeholder, default: defaultValue, required, validate, hint, transform, info })
			: suggestOptions(message);

	let shouldRenderSubmittedFrame = false;
	let activeFrame: string | undefined;

	return promptWithFallback('autocomplete', options, () =>
		promptUntilValid(
			options,
			async () => {
				const answer = await readAutocompleteValue(options);

				const value = answer.value === '' && options.default !== undefined ? options.default : answer.value;

				activeFrame = answer.frame;
				shouldRenderSubmittedFrame = answer.rendered && !answer.cancelled;

				return options.transform ? options.transform(value) : value;
			},
			(value) => {
				if (shouldRenderSubmittedFrame) {
					if (activeFrame) {
						eraseRenderedFrame(activeFrame);
					}

					renderSubmittedAutocomplete(options.message, value);
				}
			},
		),
	);
}
