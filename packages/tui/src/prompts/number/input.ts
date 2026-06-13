import { promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { cancelPrompt, PromptValidationError } from '#tui/prompt';
import { eraseRenderedFrame } from '#tui/status/frame';
import { renderQuestion } from '#tui/theme';
import { applyTypedKey } from '#tui/typed-value';
import { renderCancelledNumberValue, renderNumberValue } from '#tui/prompts/number/render';
import { steppedNumberValue } from '#tui/prompts/number/step';
import type { NumberInputOptions } from '#tui/prompts/number/types';

export type NumberReadResult = {
	cancelled: boolean;
	frame?: string;
	value: string;
};

export const readNumberValue = async (message: string, options: NumberInputOptions = {}): Promise<NumberReadResult> => {
	const environment = promptEnvironment();

	if (!environment.input.readKey) {
		if (!environment.input.readLine) {
			throw new PromptValidationError('The configured prompt input cannot read input.');
		}

		const answer = await environment.input.readLine(renderQuestion(message, options.hint));

		return {
			cancelled: false,
			value: answer === '' && options.default !== undefined ? String(options.default) : answer,
		};
	}

	let state = {
		cursor: options.default === undefined ? 0 : String(options.default).length,
		value: options.default === undefined ? '' : String(options.default),
	};

	let frame = renderNumberValue(message, state.value, state.cursor, options);

	while (true) {
		const key = await environment.input.readKey();

		if (key === null) {
			return {
				cancelled: false,
				frame,
				value: state.value,
			};
		}

		if (key === Key.up || key === Key.upArrow) {
			state.value = steppedNumberValue(state.value, 1, options);
			state.cursor = state.value.length;
			eraseRenderedFrame(frame);
			frame = renderNumberValue(message, state.value, state.cursor, options);
			continue;
		}

		if (key === Key.down || key === Key.downArrow) {
			state.value = steppedNumberValue(state.value, -1, options);
			state.cursor = state.value.length;
			eraseRenderedFrame(frame);
			frame = renderNumberValue(message, state.value, state.cursor, options);
			continue;
		}

		const next = applyTypedKey(state, key);

		if (next.cancelled) {
			eraseRenderedFrame(frame);
			renderCancelledNumberValue(message, state.value, options);

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
				frame,
				value: state.value,
			};
		}

		eraseRenderedFrame(frame);
		frame = renderNumberValue(message, state.value, state.cursor, options);
	}
};
