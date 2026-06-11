import { textOptions } from '#tui/concerns/text-options';
import { promptUntilValid } from '#tui/prompt';
import { readTypedValue } from '#tui/typed-value';
import type { TextPromptOptions } from '#tui/types';

export function textarea(options: TextPromptOptions & { rows?: number }): Promise<string>;

export function textarea(
	label: string,
	placeholder?: string,
	defaultValue?: string,
	required?: boolean | string,
	validate?: TextPromptOptions['validate'],
	hint?: string,
	rows?: number,
	transform?: TextPromptOptions['transform'],
): Promise<string>;

export async function textarea(
	message: string | (TextPromptOptions & { rows?: number }),
	placeholder = '',
	defaultValue = '',
	required: boolean | string = false,
	validate: TextPromptOptions['validate'] = undefined,
	hint = '',
	_rows = 5,
	transform: TextPromptOptions['transform'] = undefined,
): Promise<string> {
	const options = typeof message === 'string' ? textOptions({ message, label: message, placeholder, default: defaultValue, required, validate, hint, transform }) : textOptions(message);

	return promptUntilValid(options, async () => {
		const answer = await readTypedValue(options.message, {
			default: options.default,
			hint: options.hint,
			allowNewLine: true,
		});

		const value = answer === '' && options.default !== undefined ? options.default : answer;

		return options.transform ? options.transform(value) : value;
	});
}
