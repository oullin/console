import { promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { PromptValidationError } from '#tui/prompt';
import { renderQuestion } from '#tui/theme';
import { applyTypedKey } from '#tui/typed-value';

type NumberInputOptions = {
	default?: number | string;
	hint?: string;
	max?: number;
	min?: number;
	placeholder?: string;
	step?: number;
};

const numeric = (value: string): boolean => value.trim() !== '' && Number.isFinite(Number(value));

const clamp = (value: number, min?: number, max?: number): number => {
	const clampedMin = min === undefined ? value : Math.max(min, value);

	return max === undefined ? clampedMin : Math.min(max, clampedMin);
};

const steppedValue = (value: string, direction: 1 | -1, options: NumberInputOptions): string => {
	const step = Math.max(1, options.step ?? 1);

	if (value === '') {
		return String(direction === 1 ? (options.min ?? 1) : (options.max ?? 0));
	}

	if (!numeric(value)) {
		return value;
	}

	return String(clamp(Math.trunc(Number(value)) + step * direction, options.min, options.max));
};

const renderNumberValue = (message: string, value: string, options: NumberInputOptions): void => {
	const displayValue = value.length > 0 ? value : (options.placeholder ?? '');

	promptEnvironment().output.write(`${renderQuestion(message, options.hint)}${displayValue}\n`);
};

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
			state.value = steppedValue(state.value, 1, options);
			state.cursor = state.value.length;
			renderNumberValue(message, state.value, options);
			continue;
		}

		if (key === Key.down || key === Key.downArrow) {
			state.value = steppedValue(state.value, -1, options);
			state.cursor = state.value.length;
			renderNumberValue(message, state.value, options);
			continue;
		}

		const next = applyTypedKey(state, key);

		if (next.cancelled) {
			environment.error.write('Cancelled.\n');

			return state.value;
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
