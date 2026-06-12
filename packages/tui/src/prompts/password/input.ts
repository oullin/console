import { promptEnvironment } from '#tui/environment';
import { cancelPrompt, PromptValidationError } from '#tui/prompt';
import { renderQuestion } from '#tui/theme';
import { applyTypedKey } from '#tui/typed-value';
import { passwordLength, renderCancelledPasswordValue, renderPasswordValue } from '#tui/prompts/password/render';
import type { PasswordInputOptions, PasswordReadResult } from '#tui/prompts/password/types';

export const readPasswordValue = async (message: string, options: PasswordInputOptions = {}): Promise<PasswordReadResult> => {
	const environment = promptEnvironment();

	if (!environment.input.readKey) {
		if (!environment.input.readLine) {
			throw new PromptValidationError('The configured prompt input cannot read input.');
		}

		const answer = await environment.input.readLine(renderQuestion(message, options.hint));

		return {
			cancelled: false,
			value: answer === '' && options.default !== undefined ? options.default : answer,
		};
	}

	let state = {
		cursor: passwordLength(options.default ?? ''),
		value: options.default ?? '',
	};

	renderPasswordValue(message, state.value, options);

	while (true) {
		const key = await environment.input.readKey();

		if (key === null) {
			return {
				cancelled: false,
				value: state.value,
			};
		}

		const next = applyTypedKey(state, key);

		if (next.cancelled) {
			renderCancelledPasswordValue(message, state.value, options);

			return {
				cancelled: true,
				value: await cancelPrompt(state.value),
			};
		}

		state = {
			cursor: next.cursor,
			value: next.value,
		};

		if (next.submitted) {
			return {
				cancelled: false,
				value: state.value,
			};
		}

		renderPasswordValue(message, state.value, options);
	}
};
