import { promptUntilValid, promptWithFallback } from '#tui/prompt';
import { activePromptFrame } from '#tui/prompt/active-frame';
import { readConfirm } from '#tui/prompts/select/read-confirm';
import { renderSubmittedConfirm } from '#tui/prompts/select/render-confirm';
import type { ConfirmPromptOptions } from '#tui/types';

export function confirm(options: ConfirmPromptOptions): Promise<boolean>;

export function confirm(
	label: string,
	defaultValue?: boolean,
	yes?: string,
	no?: string,
	required?: boolean | string,
	validate?: ConfirmPromptOptions['validate'],
	hint?: string,
	transform?: ConfirmPromptOptions['transform'],
): Promise<boolean>;

export async function confirm(
	message: string | ConfirmPromptOptions,
	defaultValue = true,
	yes = 'Yes',
	no = 'No',
	required: boolean | string = false,
	validate: ConfirmPromptOptions['validate'] = undefined,
	hint = '',
	transform: ConfirmPromptOptions['transform'] = undefined,
): Promise<boolean> {
	const options: ConfirmPromptOptions =
		typeof message === 'string' ? { message, label: message, default: defaultValue, yes, no, required, validate, hint, transform } : { ...message, default: message.default ?? true };

	let shouldRenderSubmittedFrame = false;

	const activeFrame = activePromptFrame();

	return promptWithFallback('confirm', options, () =>
		promptUntilValid(
			options,
			async () => {
				const answer = await readConfirm(options);

				activeFrame.set(answer.frame);
				shouldRenderSubmittedFrame = answer.submitted && !answer.cancelled;

				return options.transform ? options.transform(answer.value) : answer.value;
			},
			(value) => {
				if (shouldRenderSubmittedFrame) {
					activeFrame.clear();
					renderSubmittedConfirm(options, value);
				}
			},
			activeFrame.clear,
		),
	);
}
