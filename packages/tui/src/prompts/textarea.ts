import { promptUntilValid } from '#tui/prompt';
import { readTypedValue } from '#tui/typed-value';
import type { TextareaPromptOptions } from '#tui/types';

export function textarea(options: TextareaPromptOptions): Promise<string>;

export function textarea(
	label: string,
	placeholder?: string,
	defaultValue?: string,
	required?: boolean | string,
	validate?: TextareaPromptOptions['validate'],
	hint?: string,
	rows?: number,
	transform?: TextareaPromptOptions['transform'],
): Promise<string>;

export async function textarea(
	message: string | TextareaPromptOptions,
	placeholder = '',
	defaultValue = '',
	required: boolean | string = false,
	validate: TextareaPromptOptions['validate'] = undefined,
	hint = '',
	rows = 5,
	transform: TextareaPromptOptions['transform'] = undefined,
): Promise<string> {
	const options: TextareaPromptOptions =
		typeof message === 'string'
			? { message, label: message, placeholder, default: defaultValue, required, validate, hint, rows, transform }
			: { ...message, default: message.default ?? '', rows: message.rows ?? rows };

	return promptUntilValid(options, async () => {
		const answer = await readTypedValue(options.message, {
			default: options.default,
			hint: options.hint,
			allowNewLine: true,
			placeholder: options.placeholder,
			rows: options.rows ?? rows,
		});

		const value = answer.value === '' && options.default !== undefined ? options.default : answer.value;

		return options.transform ? options.transform(value) : value;
	});
}
