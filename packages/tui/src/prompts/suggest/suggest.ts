import { promptUntilValid, promptWithFallback } from '#tui/prompt';
import { activePromptFrame } from '#tui/prompt/active-frame';
import { readSuggestionValue } from '#tui/prompts/suggest/read';
import { renderSubmittedSuggestion } from '#tui/prompts/suggest/render';
import { suggestOptions } from '#tui/prompts/suggest/options';
import { transformedTextDefault } from '#tui/prompts/text-default';
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

	const validationOptions: SuggestOptions = {
		...options,
		default: await transformedTextDefault(options),
	};

	let shouldRenderSubmittedFrame = false;

	const activeFrame = activePromptFrame();

	return promptWithFallback('suggest', options, () =>
		promptUntilValid(
			validationOptions,
			async () => {
				const answer = await readSuggestionValue(options);

				const value = answer.value === '' && options.default !== undefined ? options.default : answer.value;

				activeFrame.set(answer.frame);
				shouldRenderSubmittedFrame = answer.rendered && !answer.cancelled;

				return options.transform ? options.transform(value) : value;
			},
			(value) => {
				if (shouldRenderSubmittedFrame) {
					activeFrame.clear();
					renderSubmittedSuggestion(options.message, value);
				}
			},
			(value) => {
				options.default = value;
				activeFrame.clear();
			},
		),
	);
}
