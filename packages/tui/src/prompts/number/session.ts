import { eraseRenderedFrame } from '#tui/status/frame';
import { applyTypedKey } from '#tui/typed-value';
import { renderCancelledNumberValue, renderNumberValue } from '#tui/prompts/number/render';
import { steppedNumberValue } from '#tui/prompts/number/step';
import type { NumberInputOptions } from '#tui/prompts/number/types';

export type NumberReaderSession = {
	applyTypedInput(key: string): { cancelled: boolean; submitted: boolean };
	cancel(): void;
	frame(): string;
	step(delta: 1 | -1): void;
	value(): string;
};

export const createNumberReaderSession = (message: string, options: NumberInputOptions): NumberReaderSession => {
	let state = {
		cursor: options.hasDefault ? String(options.default).length : 0,
		value: options.hasDefault ? String(options.default) : '',
	};

	let frame = renderNumberValue(message, state.value, state.cursor, options);

	const redraw = (): void => {
		eraseRenderedFrame(frame);
		frame = renderNumberValue(message, state.value, state.cursor, options);
	};

	return {
		applyTypedInput(key) {
			const next = applyTypedKey(state, key);

			if (next.cancelled) {
				return { cancelled: true, submitted: false };
			}

			state = {
				cursor: next.cursor,
				value: next.value,
			};

			if (!next.submitted) {
				redraw();
			}

			return { cancelled: false, submitted: next.submitted };
		},
		cancel() {
			eraseRenderedFrame(frame);
			renderCancelledNumberValue(message, state.value, options);
		},
		frame() {
			return frame;
		},
		step(delta) {
			state.value = steppedNumberValue(state.value, delta, options);
			state.cursor = state.value.length;
			redraw();
		},
		value() {
			return state.value;
		},
	};
};
