import { z } from 'zod';
import type { ChoiceOptions, MaybePromise, MultiSearchPromptOptions, SearchPromptOptions } from '#tui/types';

type SearchChoiceSourceCallback<T> = (query: string) => MaybePromise<ChoiceOptions<T>>;

export type ResolvedSearchFormArguments<T> = {
	name?: string;
	options: SearchPromptOptions<T>;
};

export type ResolvedMultiSearchFormArguments<T> = {
	name?: string;
	options: MultiSearchPromptOptions<T>;
};

const searchLabelSchema = z.string();
const searchChoiceOptionsSchema = <T>(): z.ZodType<ChoiceOptions<T>> => z.union([z.array(z.unknown()), z.record(z.string(), z.string())]) as z.ZodType<ChoiceOptions<T>>;
const searchChoiceSourceCallbackSchema = <T>(): z.ZodType<SearchChoiceSourceCallback<T>> => z.function() as z.ZodType<SearchChoiceSourceCallback<T>>;
const searchChoiceSourceSchema = <T>(): z.ZodType<ChoiceOptions<T> | SearchChoiceSourceCallback<T>> =>
	z.union([searchChoiceOptionsSchema<T>(), searchChoiceSourceCallbackSchema<T>()]);

export const isSearchPromptLabel = (value: unknown): value is string => {
	return searchLabelSchema.safeParse(value).success;
};

export const isSearchPromptOptions = <TOptions>(value: TOptions | string): value is TOptions => {
	return !isSearchPromptLabel(value);
};

export const parseSearchStepName = (value: unknown): string | undefined => {
	const parsed = searchLabelSchema.safeParse(value);

	return parsed.success ? parsed.data : undefined;
};

export const parseSearchChoiceSource = <T>(value: unknown): ChoiceOptions<T> | SearchChoiceSourceCallback<T> => {
	return searchChoiceSourceSchema<T>().parse(value);
};

export const resolveSearchFormArguments = <T>(
	optionsOrLabel: SearchPromptOptions<T> | string,
	sourceOrName?: SearchPromptOptions<T>['options'] | string,
	placeholder = '',
	scroll = 5,
	validate: SearchPromptOptions<T>['validate'] = undefined,
	hint = '',
	required: SearchPromptOptions<T>['required'] = true,
	name?: string,
	transform: SearchPromptOptions<T>['transform'] = undefined,
	info: SearchPromptOptions<T>['info'] = '',
): ResolvedSearchFormArguments<T> => {
	if (isSearchPromptOptions(optionsOrLabel)) {
		return {
			name: parseSearchStepName(sourceOrName),
			options: optionsOrLabel,
		};
	}

	return {
		name,
		options: {
			message: optionsOrLabel,
			label: optionsOrLabel,
			options: parseSearchChoiceSource<T>(sourceOrName),
			placeholder,
			scroll,
			validate,
			hint,
			required,
			transform,
			info,
		},
	};
};

export const resolveMultiSearchFormArguments = <T>(
	optionsOrLabel: MultiSearchPromptOptions<T> | string,
	sourceOrName?: MultiSearchPromptOptions<T>['options'] | string,
	placeholder = '',
	scroll = 5,
	required: MultiSearchPromptOptions<T>['required'] = false,
	validate: MultiSearchPromptOptions<T>['validate'] = undefined,
	hint = 'Use the space bar to select options.',
	name?: string,
	transform: MultiSearchPromptOptions<T>['transform'] = undefined,
	info: MultiSearchPromptOptions<T>['info'] = '',
): ResolvedMultiSearchFormArguments<T> => {
	if (isSearchPromptOptions(optionsOrLabel)) {
		return {
			name: parseSearchStepName(sourceOrName),
			options: optionsOrLabel,
		};
	}

	return {
		name,
		options: {
			message: optionsOrLabel,
			label: optionsOrLabel,
			options: parseSearchChoiceSource<T>(sourceOrName),
			placeholder,
			scroll,
			required,
			validate,
			hint,
			transform,
			info,
		},
	};
};
