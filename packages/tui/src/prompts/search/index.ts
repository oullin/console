import { promptUntilValid, promptWithFallback, PromptValidationError } from '#tui/prompt';
import { activePromptFrame } from '#tui/prompt/active-frame';
import { readMultiSearchChoices } from '#tui/prompts/search/read-multi';
import { readSearchChoice } from '#tui/prompts/search/read-single';
import { renderSubmittedSearchChoice, renderSubmittedSearchChoices } from '#tui/prompts/search/render';
import { assertSearchOptions } from '#tui/prompts/search/validators/options';
import { hasPromptDefault } from '#tui/validators/default';
import type { ChoiceOptions, MultiSearchPromptOptions, SearchPromptOptions } from '#tui/types';

type NormalizedSearchPromptOptions<T> = SearchPromptOptions<T> & {
	hasDefault: boolean;
};

const transformSearchValue = async <T>(options: Pick<SearchPromptOptions<T>, 'transform'>, value: T): Promise<T> => {
	return options.transform ? options.transform(value) : value;
};

const transformedSearchDefault = async <T>(options: NormalizedSearchPromptOptions<T>): Promise<T | undefined> => {
	if (!options.hasDefault) {
		return undefined;
	}

	const rawDefault = options.default as T;

	try {
		return await transformSearchValue(options, rawDefault);
	} catch {
		return rawDefault;
	}
};

const transformedMultiSearchDefault = async <T>(options: MultiSearchPromptOptions<T> & { default: T[] }): Promise<T[]> => {
	try {
		return options.transform ? await options.transform(options.default) : options.default;
	} catch {
		return options.default;
	}
};

export function search<T>(options: SearchPromptOptions<T>): Promise<T>;

export function search<T>(
	label: string,
	options: SearchPromptOptions<T>['options'],
	placeholder?: string,
	scroll?: number,
	validate?: SearchPromptOptions<T>['validate'],
	hint?: string,
	required?: SearchPromptOptions<T>['required'],
	transform?: SearchPromptOptions<T>['transform'],
	info?: SearchPromptOptions<T>['info'],
): Promise<T>;

export async function search<T>(
	optionsOrLabel: SearchPromptOptions<T> | string,
	source?: ChoiceOptions<T> | ((query: string) => Promise<ChoiceOptions<T>> | ChoiceOptions<T>),
	placeholder = '',
	scroll = 5,
	validate: SearchPromptOptions<T>['validate'] = undefined,
	hint = '',
	required: SearchPromptOptions<T>['required'] = true,
	transform: SearchPromptOptions<T>['transform'] = undefined,
	info: SearchPromptOptions<T>['info'] = '',
): Promise<T> {
	const hasDefault = typeof optionsOrLabel === 'string' ? false : hasPromptDefault(optionsOrLabel);

	const options: NormalizedSearchPromptOptions<T> =
		typeof optionsOrLabel === 'string'
			? { message: optionsOrLabel, label: optionsOrLabel, options: source as SearchPromptOptions<T>['options'], hasDefault, placeholder, scroll, validate, hint, required, transform, info }
			: { ...optionsOrLabel, hasDefault };

	assertSearchOptions(options);

	const validationOptions: SearchPromptOptions<T> = {
		...options,
		default: await transformedSearchDefault(options),
	};

	let shouldRenderSubmittedFrame = false;
	let submittedLabel = '';

	const activeFrame = activePromptFrame();

	return promptWithFallback('search', options, () =>
		promptUntilValid(
			validationOptions,
			async (attempt) => {
				const selected = await readSearchChoice(options, attempt);

				if (selected.value === undefined) {
					throw new PromptValidationError('Please select a valid option.');
				}

				activeFrame.set(selected.frame);
				shouldRenderSubmittedFrame = selected.submitted && !selected.cancelled;
				submittedLabel = selected.submittedLabel;

				return transformSearchValue(options, selected.value);
			},
			() => {
				if (shouldRenderSubmittedFrame) {
					activeFrame.clear();
					renderSubmittedSearchChoice(options.message, submittedLabel);
				}
			},
			activeFrame.clear,
		),
	);
}

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
