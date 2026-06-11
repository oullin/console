import { ask, promptUntilValid } from '#tui/prompt';
import type { ConfirmPromptOptions } from '#tui/types';

export function confirm(options: ConfirmPromptOptions): Promise<boolean>;

export function confirm(label: string, defaultValue?: boolean, yes?: string, no?: string, required?: boolean | string, validate?: ConfirmPromptOptions['validate'], hint?: string): Promise<boolean>;

export async function confirm(
	message: string | ConfirmPromptOptions,
	defaultValue = true,
	yes = 'Yes',
	no = 'No',
	required: boolean | string = false,
	validate: ConfirmPromptOptions['validate'] = undefined,
	hint = '',
): Promise<boolean> {
	const options: ConfirmPromptOptions =
		typeof message === 'string' ? { message, label: message, default: defaultValue, yes, no, required, validate, hint } : { ...message, default: message.default ?? true };

	return promptUntilValid(options, async () => {
		const suffix = options.default === false ? ' [y/N]' : ' [Y/n]';

		const answer = (await ask(`${options.message}${suffix}`, options.hint)).trim().toLowerCase();

		if (answer === '' && options.default !== undefined) {
			return options.default;
		}

		return ['y', 'yes', options.yes?.toLowerCase()].includes(answer);
	});
}
