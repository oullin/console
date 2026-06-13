import { promptEnvironment } from '#tui/environment';
import { cancelPrompt, PromptValidationError } from '#tui/prompt';
import { eraseRenderedFrame } from '#tui/status/frame';
import { renderQuestion } from '#tui/theme';
import { applyTypedKey, initialTypedValueState } from '#tui/typed-value/edit';
import { renderCancelledTypedValue, renderTypedValue } from '#tui/typed-value/render';
import { TEXTAREA_CONTENT_WIDTH } from '#tui/typed-value/textarea';
import { renderCancelledTextareaFrame } from '#tui/typed-value/textarea-frame';
import type { TypedValueOptions, TypedValueState } from '#tui/typed-value/types';

export { applyTypedKey };
export type { TypedValueOptions, TypedValueState };

export type TypedValueReadResult = {
	cancelled: boolean;
	frame?: string;
	value: string;
};

export const readTypedValue = async (message: string, options: TypedValueOptions = {}): Promise<TypedValueReadResult> => {
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

	let state: TypedValueState = initialTypedValueState(options.default ?? '');

	let frame = renderTypedValue(message, state, options);

	while (true) {
		const key = await environment.input.readKey();

		if (key === null) {
			return {
				cancelled: false,
				frame,
				value: state.value,
			};
		}

		const next = applyTypedKey(state, key, options.allowNewLine, options.allowNewLine ? TEXTAREA_CONTENT_WIDTH : undefined);

		if (next.cancelled) {
			eraseRenderedFrame(frame);

			if (!options.allowNewLine) {
				renderCancelledTypedValue(message, state.value, options);
			} else {
				renderCancelledTextareaFrame(message, state.value, options);
			}

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
		frame = renderTypedValue(message, state, options);
	}
};
