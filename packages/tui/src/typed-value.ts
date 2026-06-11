import { promptEnvironment } from '#tui/environment';
import { cancelPrompt, PromptValidationError } from '#tui/prompt';
import { renderQuestion } from '#tui/theme';
import { applyTypedKey, initialTypedValueState } from '#tui/typed-value/edit';
import { renderTypedValue } from '#tui/typed-value/render';
import { TEXTAREA_CONTENT_WIDTH } from '#tui/typed-value/textarea';
import type { TypedValueOptions, TypedValueState } from '#tui/typed-value/types';

export { applyTypedKey };
export type { TypedValueOptions, TypedValueState };

export const readTypedValue = async (message: string, options: TypedValueOptions = {}): Promise<string> => {
	const environment = promptEnvironment();

	if (!environment.input.readKey) {
		if (!environment.input.readLine) {
			throw new PromptValidationError('The configured prompt input cannot read input.');
		}

		const answer = await environment.input.readLine(renderQuestion(message, options.hint));

		return answer === '' && options.default !== undefined ? options.default : answer;
	}

	let state: TypedValueState = initialTypedValueState(options.default ?? '');

	renderTypedValue(message, state, options);

	while (true) {
		const key = await environment.input.readKey();

		if (key === null) {
			return state.value;
		}

		const next = applyTypedKey(state, key, options.allowNewLine, options.allowNewLine ? TEXTAREA_CONTENT_WIDTH : undefined);

		if (next.cancelled) {
			environment.error.write('Cancelled.\n');

			return cancelPrompt(state.value);
		}

		state = {
			cursor: next.cursor,
			value: next.value,
		};

		if (next.submitted) {
			environment.output.write('\n');

			return state.value;
		}

		renderTypedValue(message, state, options);
	}
};
