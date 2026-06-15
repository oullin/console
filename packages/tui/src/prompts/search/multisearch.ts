import { promptUntilValid, promptWithFallback } from '#tui/prompt';
import { activePromptFrame } from '#tui/prompt/active-frame';
import { transformedMultiSearchDefault } from '#tui/prompts/search/defaults';
import { readMultiSearchChoices } from '#tui/prompts/search/read-multi';
import { renderSubmittedSearchChoices } from '#tui/prompts/search/render';
import type { ChoiceOptions, MultiSearchPromptOptions } from '#tui/types';

export function multisearch<T>(options: MultiSearchPromptOptions<T>): Promise<T[]>;

export function multisearch<T>(
	label: string,
	options: MultiSearchPromptOptions<T>['options'],
	placeholder?: string,
	scroll?: number,
	required?: MultiSearchPromptOptions<T>['required'],
	validate?: MultiSearchPromptOptions<T>['validate'],
	hint?: string,
	transform?: MultiSearchPromptOptions<T>['transform'],
	info?: MultiSearchPromptOptions<T>['info'],
): Promise<T[]>;

export async function multisearch<T>(
	optionsOrLabel: MultiSearchPromptOptions<T> | string,
	source?: ChoiceOptions<T> | ((query: string) => Promise<ChoiceOptions<T>> | ChoiceOptions<T>),
	placeholder = '',
	scroll = 5,
	required: MultiSearchPromptOptions<T>['required'] = false,
	validate: MultiSearchPromptOptions<T>['validate'] = undefined,
	hint = 'Use the space bar to select options.',
	transform: MultiSearchPromptOptions<T>['transform'] = undefined,
	info: MultiSearchPromptOptions<T>['info'] = '',
): Promise<T[]> {
	const options =
		typeof optionsOrLabel === 'string'
			? { message: optionsOrLabel, label: optionsOrLabel, options: source as MultiSearchPromptOptions<T>['options'], placeholder, scroll, required, validate, hint, transform, info }
			: optionsOrLabel;

	const promptOptions = { ...options, default: options.default ?? [] };

	const validationOptions: MultiSearchPromptOptions<T> = {
		...promptOptions,
		default: await transformedMultiSearchDefault(promptOptions),
	};

	let shouldRenderSubmittedFrame = false;
	let submittedLabels: string[] = [];

	const activeFrame = activePromptFrame();

	return promptWithFallback('multisearch', promptOptions, () =>
		promptUntilValid(
			validationOptions,
			async () => {
				const selected = await readMultiSearchChoices(promptOptions);

				activeFrame.set(selected.frame);
				shouldRenderSubmittedFrame = selected.submitted && !selected.cancelled;
				submittedLabels = selected.submittedLabels;

				return promptOptions.transform ? promptOptions.transform(selected.value) : selected.value;
			},
			() => {
				if (shouldRenderSubmittedFrame) {
					activeFrame.clear();
					renderSubmittedSearchChoices(promptOptions.message, submittedLabels);
				}
			},
			activeFrame.clear,
		),
	);
}
