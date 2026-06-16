import { z } from 'zod';
import type { ChoiceOptions, MultiSelectPromptOptions, SelectPromptOptions } from '#tui/types';

const selectPromptLabelSchema = z.string();
const selectPromptChoicesSchema = z.union([z.array(z.unknown()), z.record(z.string(), z.string())]);
const selectPromptChoicesTypedSchema = <T>(): z.ZodType<ChoiceOptions<T>> => selectPromptChoicesSchema as z.ZodType<ChoiceOptions<T>>;
const selectPromptDefaultSchema = z.boolean();

export type ResolvedSelectFormArguments<T> = {
	name?: string;
	options: SelectPromptOptions<T>;
};

export type ResolvedMultiSelectFormArguments<T> = {
	name?: string;
	options: MultiSelectPromptOptions<T>;
};

export const isSelectPromptLabel = (value: unknown): value is string => {
	return selectPromptLabelSchema.safeParse(value).success;
};

export const isSelectPromptOptions = <TOptions>(value: TOptions | string): value is TOptions => {
	return !isSelectPromptLabel(value);
};

export const parseSelectStepName = (value: unknown): string | undefined => {
	const parsed = selectPromptLabelSchema.safeParse(value);

	return parsed.success ? parsed.data : undefined;
};

export const parseSelectChoiceOptions = <T>(value: unknown): ChoiceOptions<T> => {
	return selectPromptChoicesTypedSchema<T>().parse(value);
};

export const parseConfirmDefault = (value: unknown, fallback: boolean): boolean => {
	const parsed = selectPromptDefaultSchema.safeParse(value);

	return parsed.success ? parsed.data : fallback;
};

export const resolveSelectFormArguments = <T>(
	optionsOrLabel: SelectPromptOptions<T> | string,
	choicesOrName?: ChoiceOptions<T> | string,
	defaultValue?: T,
	scroll = 5,
	validate: SelectPromptOptions<T>['validate'] = undefined,
	hint = '',
	required: boolean | string = true,
	name?: string,
	transform: SelectPromptOptions<T>['transform'] = undefined,
	info: SelectPromptOptions<T>['info'] = '',
): ResolvedSelectFormArguments<T> => {
	if (isSelectPromptOptions(optionsOrLabel)) {
		return {
			name: parseSelectStepName(choicesOrName),
			options: optionsOrLabel,
		};
	}

	return {
		name,
		options: {
			message: optionsOrLabel,
			options: parseSelectChoiceOptions<T>(choicesOrName),
			default: defaultValue,
			scroll,
			validate,
			hint,
			required,
			transform,
			info,
		},
	};
};

export const resolveMultiSelectFormArguments = <T>(
	optionsOrLabel: MultiSelectPromptOptions<T> | string,
	choicesOrName?: ChoiceOptions<T> | string,
	defaultValue: T[] = [],
	scroll = 5,
	required: boolean | string = false,
	validate: MultiSelectPromptOptions<T>['validate'] = undefined,
	hint = 'Use the space bar to select options.',
	name?: string,
	transform: MultiSelectPromptOptions<T>['transform'] = undefined,
	info: MultiSelectPromptOptions<T>['info'] = '',
): ResolvedMultiSelectFormArguments<T> => {
	if (isSelectPromptOptions(optionsOrLabel)) {
		return {
			name: parseSelectStepName(choicesOrName),
			options: optionsOrLabel,
		};
	}

	return {
		name,
		options: {
			message: optionsOrLabel,
			options: parseSelectChoiceOptions<T>(choicesOrName),
			default: defaultValue,
			scroll,
			required,
			validate,
			hint,
			transform,
			info,
		},
	};
};
