import { promptUntilValid, PromptValidationError } from '#tui/prompt';
import { readMultiSearchChoices } from '#tui/prompts/search/read-multi';
import { readSearchChoice } from '#tui/prompts/search/read-single';
import { assertSearchOptions } from '#tui/prompts/search/validators/options';
import type { ChoiceOptions, MultiSearchPromptOptions, SearchPromptOptions } from '#tui/types';

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
	const options =
		typeof optionsOrLabel === 'string'
			? { message: optionsOrLabel, label: optionsOrLabel, options: source as SearchPromptOptions<T>['options'], placeholder, scroll, validate, hint, required, transform, info }
			: optionsOrLabel;

	assertSearchOptions(options);

	return promptUntilValid(options, async (attempt) => {
		const selected = await readSearchChoice(options, attempt);

		if (selected === undefined) {
			throw new PromptValidationError('Please select a valid option.');
		}

		return options.transform ? options.transform(selected) : selected;
	});
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

	return promptUntilValid(promptOptions, async () => {
		const selected = await readMultiSearchChoices(promptOptions);

		return promptOptions.transform ? promptOptions.transform(selected) : selected;
	});
}
