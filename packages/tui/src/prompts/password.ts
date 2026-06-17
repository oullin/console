import { normalizePasswordPromptOptions } from '#tui/prompts/password/options';
import { runPasswordPrompt } from '#tui/prompts/password/run';
import type { TextPromptOptions } from '#tui/types';

export function password(options: TextPromptOptions): Promise<string>;

export function password(
	label: string,
	placeholder?: string,
	required?: boolean | string,
	validate?: TextPromptOptions['validate'],
	hint?: string,
	transform?: TextPromptOptions['transform'],
): Promise<string>;

export async function password(
	message: string | TextPromptOptions,
	placeholder = '',
	required: boolean | string = false,
	validate: TextPromptOptions['validate'] = undefined,
	hint = '',
	transform: TextPromptOptions['transform'] = undefined,
): Promise<string> {
	return runPasswordPrompt(
		normalizePasswordPromptOptions({
			hint,
			message,
			placeholder,
			required,
			transform,
			validate,
		}),
	);
}
