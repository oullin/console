import { promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { cancelPrompt, PromptValidationError } from '#tui/prompt';
import { renderQuestion } from '#tui/theme';
import { applyTypedKey } from '#tui/typed-value';
import { renderNumberValue } from '#tui/prompts/number/render';
import { steppedNumberValue } from '#tui/prompts/number/step';
import type { NumberInputOptions } from '#tui/prompts/number/types';

export const readNumberValue = async (message: string, options: NumberInputOptions = {}): Promise<string> => {
	const environment = promptEnvironment();

	if (!environment.input.readKey) {
		if (!environment.input.readLine) {
			throw new PromptValidationError('The configured prompt input cannot read input.');
		}

		const answer = await environment.input.readLine(renderQuestion(message, options.hint));

		return answer === '' && options.default !== undefined ? String(options.default) : answer;
	}

	let state = {
		cursor: options.default === undefined ? 0 : String(options.default).length,
		value: options.default === undefined ? '' : String(options.default),
	};

	renderNumberValue(message, state.value, options);

	while (true) {
		const key = await environment.input.readKey();

		if (key === null) {
			return state.value;
		}

		if (key === Key.up || key === Key.upArrow) {
			state.value = steppedNumberValue(state.value, 1, options);
			state.cursor = state.value.length;
			renderNumberValue(message, state.value, options);
			continue;
		}

		if (key === Key.down || key === Key.downArrow) {
			state.value = steppedNumberValue(state.value, -1, options);
			state.cursor = state.value.length;
			renderNumberValue(message, state.value, options);
			continue;
		}

		const next = applyTypedKey(state, key);

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

		renderNumberValue(message, state.value, options);
	}
};
