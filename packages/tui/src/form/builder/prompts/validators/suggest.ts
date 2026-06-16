import { z } from 'zod';
import type { SuggestOptions } from '#tui/prompts/suggest/options';
import type { MaybePromise, TextPromptOptions } from '#tui/types';

type SuggestSourceCallback = (query: string) => MaybePromise<string[]>;

export type ResolvedSuggestFormArguments = {
	name?: string;
	options: SuggestOptions;
};

const suggestLabelSchema = z.string();
const suggestSourceCallbackSchema: z.ZodType<SuggestSourceCallback> = z.function() as z.ZodType<SuggestSourceCallback>;
const suggestSourceSchema = z.union([z.array(z.string()), suggestSourceCallbackSchema]);

export const isSuggestPromptLabel = (value: unknown): value is string => {
	return suggestLabelSchema.safeParse(value).success;
};

export const isSuggestPromptOptions = <TOptions>(value: TOptions | string): value is TOptions => {
	return !isSuggestPromptLabel(value);
};

export const parseSuggestStepName = (value: unknown): string | undefined => {
	const parsed = suggestLabelSchema.safeParse(value);

	return parsed.success ? parsed.data : undefined;
};

export const parseSuggestSource = (value: unknown): string[] | SuggestSourceCallback => {
	return suggestSourceSchema.parse(value);
};

export const resolveSuggestFormArguments = (
	optionsOrLabel: SuggestOptions | string,
	sourceOrName?: SuggestOptions['options'] | string,
	placeholder = '',
	defaultValue = '',
	scroll = 5,
	required: boolean | string = false,
	validate: TextPromptOptions['validate'] = undefined,
	hint = '',
	name?: string,
	transform: TextPromptOptions['transform'] = undefined,
	info: SuggestOptions['info'] = '',
): ResolvedSuggestFormArguments => {
	if (isSuggestPromptOptions(optionsOrLabel)) {
		return {
			name: parseSuggestStepName(sourceOrName),
			options: optionsOrLabel,
		};
	}

	return {
		name,
		options: {
			message: optionsOrLabel,
			label: optionsOrLabel,
			options: parseSuggestSource(sourceOrName),
			placeholder,
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

export const resolveAutocompleteFormArguments = (
	optionsOrLabel: SuggestOptions | string,
	sourceOrName?: SuggestOptions['options'] | string,
	placeholder = '',
	defaultValue = '',
	required: boolean | string = false,
	validate: TextPromptOptions['validate'] = undefined,
	hint = '',
	name?: string,
	transform: TextPromptOptions['transform'] = undefined,
	info: SuggestOptions['info'] = '',
): ResolvedSuggestFormArguments => {
	if (isSuggestPromptOptions(optionsOrLabel)) {
		return {
			name: parseSuggestStepName(sourceOrName),
			options: optionsOrLabel,
		};
	}

	return {
		name,
		options: {
			message: optionsOrLabel,
			label: optionsOrLabel,
			options: parseSuggestSource(sourceOrName),
			placeholder,
			default: defaultValue,
			required,
			validate,
			hint,
			transform,
			info,
		},
	};
};
