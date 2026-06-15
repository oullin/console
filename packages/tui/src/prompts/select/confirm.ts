import { promptUntilValid, promptWithFallback } from '#tui/prompt';
import { activePromptFrame } from '#tui/prompt/active-frame';
import { readConfirm } from '#tui/prompts/select/read-confirm';
import { renderSubmittedConfirm } from '#tui/prompts/select/render-confirm';
import { hasPromptDefault } from '#tui/validators/default';
import type { ConfirmPromptOptions } from '#tui/types';

type NormalizedConfirmPromptOptions = ConfirmPromptOptions & {
	default: boolean;
	hasDefault: boolean;
};

const transformConfirmValue = async (options: Pick<ConfirmPromptOptions, 'transform'>, value: boolean): Promise<boolean> => {
	return options.transform ? options.transform(value) : value;
};

const transformedConfirmDefault = async (options: NormalizedConfirmPromptOptions): Promise<boolean> => {
	try {
		return await transformConfirmValue(options, options.default);
	} catch {
		return options.default;
	}
};

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
	const hasDefault = typeof message === 'string' ? arguments.length >= 2 && defaultValue !== undefined : hasPromptDefault(message);

	const options: NormalizedConfirmPromptOptions =
		typeof message === 'string'
			? { message, label: message, default: hasDefault ? defaultValue : true, hasDefault, yes, no, required, validate, hint, transform }
			: { ...message, default: hasDefault ? (message.default as boolean) : true, hasDefault };

	const validationOptions: ConfirmPromptOptions = {
		...options,
		default: await transformedConfirmDefault(options),
	};

	let shouldRenderSubmittedFrame = false;

	const activeFrame = activePromptFrame();

	return promptWithFallback('confirm', options, () =>
		promptUntilValid(
			validationOptions,
			async () => {
				const answer = await readConfirm(options);

				activeFrame.set(answer.frame);
				shouldRenderSubmittedFrame = answer.submitted && !answer.cancelled;

				return transformConfirmValue(options, answer.value);
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
