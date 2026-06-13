export { confirm } from '#tui/prompts/select/confirm';

import { promptUntilValid, promptWithFallback } from '#tui/prompt';
import { normalizeChoices } from '#tui/concerns/choices';
import { eraseRenderedFrame } from '#tui/status/frame';
import { readMultipleChoices } from '#tui/prompts/select/read-multiple';
import { readSelectedChoice } from '#tui/prompts/select/read-selected';
import { renderSubmittedChoice, renderSubmittedChoices } from '#tui/prompts/select/render';
import { assertSelectOptions } from '#tui/prompts/select/validators/options';
import type { ChoiceOptions, MultiSelectPromptOptions, SelectPromptOptions } from '#tui/types';

export function select<T>(options: SelectPromptOptions<T>): Promise<T>;

export function select<T>(
	label: string,
	options: ChoiceOptions<T>,
	defaultValue?: T,
	scroll?: number,
	validate?: SelectPromptOptions<T>['validate'],
	hint?: string,
	required?: SelectPromptOptions<T>['required'],
	transform?: SelectPromptOptions<T>['transform'],
	info?: SelectPromptOptions<T>['info'],
): Promise<T>;

export async function select<T>(
	optionsOrLabel: SelectPromptOptions<T> | string,
	source?: ChoiceOptions<T>,
	defaultValue?: T,
	scroll = 5,
	validate: SelectPromptOptions<T>['validate'] = undefined,
	hint = '',
	required: SelectPromptOptions<T>['required'] = true,
	transform: SelectPromptOptions<T>['transform'] = undefined,
	info: SelectPromptOptions<T>['info'] = '',
): Promise<T> {
	const options =
		typeof optionsOrLabel === 'string'
			? { message: optionsOrLabel, label: optionsOrLabel, options: source as ChoiceOptions<T>, default: defaultValue, scroll, validate, hint, required, transform, info }
			: optionsOrLabel;

	assertSelectOptions(options);

	const promptOptions = { ...options, required: options.required ?? true };
	const choices = normalizeChoices(options.options);

	let shouldRenderSubmittedFrame = false;
	let submittedLabel = '';
	let activeFrame: string | undefined;

	return promptWithFallback('select', promptOptions, () =>
		promptUntilValid(
			promptOptions,
			async () => {
				const selected = await readSelectedChoice(promptOptions.message, choices, promptOptions.default, promptOptions.hint, promptOptions.scroll, promptOptions.info);

				activeFrame = selected.frame;
				shouldRenderSubmittedFrame = selected.submitted && !selected.cancelled;
				submittedLabel = selected.submittedLabel;

				return promptOptions.transform ? promptOptions.transform(selected.value) : selected.value;
			},
			() => {
				if (shouldRenderSubmittedFrame) {
					if (activeFrame) {
						eraseRenderedFrame(activeFrame);
					}

					renderSubmittedChoice(promptOptions.message, submittedLabel);
				}
			},
		),
	);
}

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
	const choices = normalizeChoices(options.options);

	let shouldRenderSubmittedFrame = false;
	let submittedLabels: string[] = [];
	let activeFrame: string | undefined;

	return promptWithFallback('multiselect', promptOptions, () =>
		promptUntilValid(
			promptOptions,
			async () => {
				const selected = await readMultipleChoices(promptOptions.message, choices, promptOptions.default, promptOptions.hint, promptOptions.scroll, promptOptions.info);

				activeFrame = selected.frame;
				shouldRenderSubmittedFrame = selected.submitted && !selected.cancelled;
				submittedLabels = selected.submittedLabels;

				return promptOptions.transform ? promptOptions.transform(selected.value) : selected.value;
			},
			() => {
				if (shouldRenderSubmittedFrame) {
					if (activeFrame) {
						eraseRenderedFrame(activeFrame);
					}

					renderSubmittedChoices(promptOptions.message, submittedLabels);
				}
			},
		),
	);
}
