import { normalizeChoices } from '#tui/concerns/choices';
import { promptUntilValid, promptWithFallback } from '#tui/prompt';
import { activePromptFrame } from '#tui/prompt/active-frame';
import { transformSelectValue, transformedSelectDefault } from '#tui/prompts/select/defaults';
import { readSelectedChoice } from '#tui/prompts/select/read-selected';
import { renderSubmittedChoice } from '#tui/prompts/select/render';
import { assertSelectOptions } from '#tui/prompts/select/validators/options';
import { hasPromptDefault } from '#tui/validators/default';
import type { NormalizedSelectPromptOptions } from '#tui/prompts/select/defaults';
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
	const hasDefault = typeof optionsOrLabel === 'string' ? arguments.length >= 3 && defaultValue !== undefined : hasPromptDefault(optionsOrLabel);

	const options: NormalizedSelectPromptOptions<T> =
		typeof optionsOrLabel === 'string'
			? { message: optionsOrLabel, label: optionsOrLabel, options: source as ChoiceOptions<T>, default: defaultValue, hasDefault, scroll, validate, hint, required, transform, info }
			: { ...optionsOrLabel, hasDefault };

	assertSelectOptions(options);

	const promptOptions: NormalizedSelectPromptOptions<T> = { ...options, required: options.required ?? true };

	const validationOptions: SelectPromptOptions<T> = {
		...promptOptions,
		default: await transformedSelectDefault(promptOptions),
	};

	const choices = normalizeChoices(options.options);

	let shouldRenderSubmittedFrame = false;
	let submittedLabel = '';

	const activeFrame = activePromptFrame();

	return promptWithFallback('select', promptOptions, () =>
		promptUntilValid(
			validationOptions,
			async () => {
				const selected = await readSelectedChoice(
					promptOptions.message,
					choices,
					promptOptions.default,
					promptOptions.hasDefault,
					promptOptions.hint,
					promptOptions.scroll,
					promptOptions.info,
				);

				activeFrame.set(selected.frame);
				shouldRenderSubmittedFrame = selected.submitted && !selected.cancelled;
				submittedLabel = selected.submittedLabel;

				return transformSelectValue(promptOptions, selected.value);
			},
			() => {
				if (shouldRenderSubmittedFrame) {
					activeFrame.clear();
					renderSubmittedChoice(promptOptions.message, submittedLabel);
				}
			},
			activeFrame.clear,
		),
	);
}
