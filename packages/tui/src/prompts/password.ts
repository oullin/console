import { textOptions } from '#tui/concerns/text-options';
import { promptUntilValid } from '#tui/prompt';
import { readPasswordValue } from '#tui/prompts/password/input';
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
	const options = typeof message === 'string' ? textOptions({ message, label: message, placeholder, required, validate, hint, transform }) : textOptions(message);

	return promptUntilValid(options, async () => {
		const value = await readPasswordValue(options.message, {
			hint: options.hint,
			placeholder: options.placeholder,
		});

		return options.transform ? options.transform(value) : value;
	});
}
