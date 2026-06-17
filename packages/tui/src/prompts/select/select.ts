import { normalizeSelectPromptOptions, selectHasDefault } from '#tui/prompts/select/options';
import { runSelectPrompt } from '#tui/prompts/select/run';
import type { ChoiceOptions, SelectPromptOptions } from '#tui/types';

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
	return runSelectPrompt(
		normalizeSelectPromptOptions(optionsOrLabel, source, defaultValue, scroll, validate, hint, required, transform, info, selectHasDefault(optionsOrLabel, arguments.length, defaultValue)),
	);
}
