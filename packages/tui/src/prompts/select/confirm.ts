import { promptUntilValid } from '#tui/prompt';
import { readConfirm } from '#tui/prompts/select/read-confirm';
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

	return promptUntilValid(options, async () => readConfirm(options));
}
