import type { ChoiceOptions, MultiSelectPromptOptions } from '#tui/types';

export type NormalizedMultiSelectPromptOptions<T> = MultiSelectPromptOptions<T> & {
	default: T[];
};

export const normalizeMultiSelectPromptOptions = <T>(
	optionsOrLabel: MultiSelectPromptOptions<T> | string,
	source: ChoiceOptions<T> | undefined,
	defaultValue: T[],
	scroll: number,
	required: MultiSelectPromptOptions<T>['required'],
	validate: MultiSelectPromptOptions<T>['validate'],
	hint: string,
	transform: MultiSelectPromptOptions<T>['transform'],
	info: MultiSelectPromptOptions<T>['info'],
): NormalizedMultiSelectPromptOptions<T> => {
	const options =
		typeof optionsOrLabel === 'string'
			? { message: optionsOrLabel, label: optionsOrLabel, options: source as ChoiceOptions<T>, default: defaultValue, scroll, required, validate, hint, transform, info }
			: optionsOrLabel;

	return { ...options, default: options.default ?? [] };
};
