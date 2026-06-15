export { confirm } from '#tui/prompts/select/confirm';

import { promptUntilValid, promptWithFallback } from '#tui/prompt';
import { activePromptFrame } from '#tui/prompt/active-frame';
import { normalizeChoices } from '#tui/concerns/choices';
import { readMultipleChoices } from '#tui/prompts/select/read-multiple';
import { readSelectedChoice } from '#tui/prompts/select/read-selected';
import { renderSubmittedChoice, renderSubmittedChoices } from '#tui/prompts/select/render';
import { assertSelectOptions } from '#tui/prompts/select/validators/options';
import { hasPromptDefault } from '#tui/validators/default';
import type { ChoiceOptions, MultiSelectPromptOptions, SelectPromptOptions } from '#tui/types';

type NormalizedSelectPromptOptions<T> = SelectPromptOptions<T> & {
	hasDefault: boolean;
};

const transformSelectValue = async <T>(options: Pick<SelectPromptOptions<T>, 'transform'>, value: T): Promise<T> => {
	return options.transform ? options.transform(value) : value;
};

const transformedSelectDefault = async <T>(options: NormalizedSelectPromptOptions<T>): Promise<T | undefined> => {
	if (!options.hasDefault) {
		return undefined;
	}

	const rawDefault = options.default as T;

	try {
		return await transformSelectValue(options, rawDefault);
	} catch {
		return rawDefault;
	}
};

const transformedMultiSelectDefault = async <T>(options: MultiSelectPromptOptions<T> & { default: T[] }): Promise<T[]> => {
	try {
		return options.transform ? await options.transform(options.default) : options.default;
	} catch {
		return options.default;
	}
};

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
	const hasDefault = typeof optionsOrLabel === 'string' ? arguments.length >= 3 && defaultValue !== undefined : hasPromptDefault(optionsOrLabel);

	const options: NormalizedSelectPromptOptions<T> =
		typeof optionsOrLabel === 'string'
			? { message: optionsOrLabel, label: optionsOrLabel, options: source as ChoiceOptions<T>, default: defaultValue, hasDefault, scroll, validate, hint, required, transform, info }
			: { ...optionsOrLabel, hasDefault };

	assertSelectOptions(options);

	const promptOptions: NormalizedSelectPromptOptions<T> = { ...options, required: options.required ?? true };

	const validationOptions: SelectPromptOptions<T> = {
		...promptOptions,
		default: await transformedSelectDefault(promptOptions),
	};

	const choices = normalizeChoices(options.options);

	let shouldRenderSubmittedFrame = false;
	let submittedLabel = '';

	const activeFrame = activePromptFrame();

	return promptWithFallback('select', promptOptions, () =>
		promptUntilValid(
			validationOptions,
			async () => {
				const selected = await readSelectedChoice(
					promptOptions.message,
					choices,
					promptOptions.default,
					promptOptions.hasDefault,
					promptOptions.hint,
					promptOptions.scroll,
					promptOptions.info,
				);

				activeFrame.set(selected.frame);
				shouldRenderSubmittedFrame = selected.submitted && !selected.cancelled;
				submittedLabel = selected.submittedLabel;

				return transformSelectValue(promptOptions, selected.value);
			},
			() => {
				if (shouldRenderSubmittedFrame) {
					activeFrame.clear();
					renderSubmittedChoice(promptOptions.message, submittedLabel);
				}
			},
			activeFrame.clear,
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
