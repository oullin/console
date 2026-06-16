import { normalizeSearchPromptOptions } from '#tui/prompts/search/options';
import { runSearchPrompt } from '#tui/prompts/search/run';
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
	return runSearchPrompt(normalizeSearchPromptOptions(optionsOrLabel, source, placeholder, scroll, validate, hint, required, transform, info));
}
