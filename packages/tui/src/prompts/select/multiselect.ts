import { normalizeChoices } from '#tui/concerns/choices';
import { promptUntilValid, promptWithFallback } from '#tui/prompt';
import { activePromptFrame } from '#tui/prompt/active-frame';
import { transformedMultiSelectDefault } from '#tui/prompts/select/defaults';
import { readMultipleChoices } from '#tui/prompts/select/read-multiple';
import { renderSubmittedChoices } from '#tui/prompts/select/render';
import type { ChoiceOptions, MultiSelectPromptOptions } from '#tui/types';

export function multiselect<T>(options: MultiSelectPromptOptions<T>): Promise<T[]>;

export function multiselect<T>(
	label: string,
	options: ChoiceOptions<T>,
	defaultValue?: T[],
	scroll?: number,
	required?: MultiSelectPromptOptions<T>['required'],
	validate?: MultiSelectPromptOptions<T>['validate'],
	hint?: string,
	transform?: MultiSelectPromptOptions<T>['transform'],
	info?: MultiSelectPromptOptions<T>['info'],
): Promise<T[]>;

export async function multiselect<T>(
	optionsOrLabel: MultiSelectPromptOptions<T> | string,
	source?: ChoiceOptions<T>,
	defaultValue: T[] = [],
	scroll = 5,
	required: MultiSelectPromptOptions<T>['required'] = false,
	validate: MultiSelectPromptOptions<T>['validate'] = undefined,
	hint = 'Use the space bar to select options.',
	transform: MultiSelectPromptOptions<T>['transform'] = undefined,
	info: MultiSelectPromptOptions<T>['info'] = '',
): Promise<T[]> {
	const options =
		typeof optionsOrLabel === 'string'
			? { message: optionsOrLabel, label: optionsOrLabel, options: source as ChoiceOptions<T>, default: defaultValue, scroll, required, validate, hint, transform, info }
			: optionsOrLabel;

	const promptOptions = { ...options, default: options.default ?? [] };

	const validationOptions: MultiSelectPromptOptions<T> = {
		...promptOptions,
		default: await transformedMultiSelectDefault(promptOptions),
	};

	const choices = normalizeChoices(options.options);

	let shouldRenderSubmittedFrame = false;
	let submittedLabels: string[] = [];

	const activeFrame = activePromptFrame();

	return promptWithFallback('multiselect', promptOptions, () =>
		promptUntilValid(
			validationOptions,
			async () => {
				const selected = await readMultipleChoices(promptOptions.message, choices, promptOptions.default, promptOptions.hint, promptOptions.scroll, promptOptions.info);

				activeFrame.set(selected.frame);
				shouldRenderSubmittedFrame = selected.submitted && !selected.cancelled;
				submittedLabels = selected.submittedLabels;

				return promptOptions.transform ? promptOptions.transform(selected.value) : selected.value;
			},
			() => {
				if (shouldRenderSubmittedFrame) {
					activeFrame.clear();
					renderSubmittedChoices(promptOptions.message, submittedLabels);
				}
			},
			activeFrame.clear,
		),
	);
}
