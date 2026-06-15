import { promptUntilValid, promptWithFallback, PromptValidationError } from '#tui/prompt';
import { activePromptFrame } from '#tui/prompt/active-frame';
import { transformSearchValue, transformedSearchDefault } from '#tui/prompts/search/defaults';
import { readSearchChoice } from '#tui/prompts/search/read-single';
import { renderSubmittedSearchChoice } from '#tui/prompts/search/render';
import { assertSearchOptions } from '#tui/prompts/search/validators/options';
import { hasPromptDefault } from '#tui/validators/default';
import type { NormalizedSearchPromptOptions } from '#tui/prompts/search/defaults';
import type { ChoiceOptions, SearchPromptOptions } from '#tui/types';

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
