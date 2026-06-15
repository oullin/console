import { promptUntilValid, promptWithFallback } from '#tui/prompt';
import { activePromptFrame } from '#tui/prompt/active-frame';
import { readAutocompleteValue } from '#tui/prompts/suggest/read-autocomplete';
import { renderSubmittedAutocomplete } from '#tui/prompts/suggest/render-autocomplete';
import { suggestOptions } from '#tui/prompts/suggest/options';
import { transformedTextDefault } from '#tui/prompts/text-default';
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
	const options =
		typeof message === 'string'
			? suggestOptions({ message, label: message, options: source, placeholder, default: defaultValue, required, validate, hint, transform, info })
			: suggestOptions(message);

	const validationOptions: SuggestOptions = {
		...options,
		default: await transformedTextDefault(options),
	};

	let shouldRenderSubmittedFrame = false;

	const activeFrame = activePromptFrame();

	return promptWithFallback('autocomplete', options, () =>
		promptUntilValid(
			validationOptions,
			async () => {
				const answer = await readAutocompleteValue(options);

				const value = answer.value === '' && options.default !== undefined ? options.default : answer.value;

				activeFrame.set(answer.frame);
				shouldRenderSubmittedFrame = answer.rendered && !answer.cancelled;

				return options.transform ? options.transform(value) : value;
			},
			(value) => {
				if (shouldRenderSubmittedFrame) {
					activeFrame.clear();
					renderSubmittedAutocomplete(options.message, value);
				}
			},
			(value) => {
				options.default = value;
				activeFrame.clear();
			},
		),
	);
}
