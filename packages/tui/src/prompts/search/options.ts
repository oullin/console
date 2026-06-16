import { assertSearchOptions } from '#tui/prompts/search/validators/options';
import { hasPromptDefault } from '#tui/validators/default';
import type { NormalizedSearchPromptOptions } from '#tui/prompts/search/defaults';
import type { ChoiceOptions, SearchPromptOptions } from '#tui/types';

export const normalizeSearchPromptOptions = <T>(
	optionsOrLabel: SearchPromptOptions<T> | string,
	source: ChoiceOptions<T> | ((query: string) => Promise<ChoiceOptions<T>> | ChoiceOptions<T>) | undefined,
	placeholder: string,
	scroll: number,
	validate: SearchPromptOptions<T>['validate'],
	hint: string,
	required: SearchPromptOptions<T>['required'],
	transform: SearchPromptOptions<T>['transform'],
	info: SearchPromptOptions<T>['info'],
): NormalizedSearchPromptOptions<T> => {
	const hasDefault = typeof optionsOrLabel === 'string' ? false : hasPromptDefault(optionsOrLabel);

	const options: NormalizedSearchPromptOptions<T> =
		typeof optionsOrLabel === 'string'
			? { message: optionsOrLabel, label: optionsOrLabel, options: source as SearchPromptOptions<T>['options'], hasDefault, placeholder, scroll, validate, hint, required, transform, info }
			: { ...optionsOrLabel, hasDefault };

	assertSearchOptions(options);

	return options;
};
