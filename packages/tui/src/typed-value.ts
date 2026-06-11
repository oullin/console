import { promptEnvironment } from '#tui/environment';
import { Key, oneOf } from '#tui/key';
import { PromptValidationError } from '#tui/prompt';
import { renderQuestion } from '#tui/theme';

export type TypedValueState = {
	cursor: number;
	value: string;
};

const characters = (value: string): string[] => [...value];
const fromCharacters = (value: string[]): string => value.join('');

const isPrintable = (key: string): boolean => {
	return [...key].every((character) => {
		const code = character.codePointAt(0) ?? 0;

		return code >= 32 && code !== 127;
	});
};

export const applyTypedKey = (state: TypedValueState, key: string, allowNewLine = false): TypedValueState & { submitted: boolean; cancelled: boolean } => {
	const value = characters(state.value);

	let cursor = state.cursor;

	if (key === Key.ctrlC) {
		return { cursor, value: fromCharacters(value), submitted: false, cancelled: true };
	}

	if (key === Key.ctrlD && allowNewLine) {
		return { cursor, value: fromCharacters(value), submitted: true, cancelled: false };
	}

	if (key === Key.enter) {
		if (!allowNewLine) {
			return { cursor, value: fromCharacters(value), submitted: true, cancelled: false };
		}

		value.splice(cursor, 0, '\n');
		cursor += 1;

		return { cursor, value: fromCharacters(value), submitted: false, cancelled: false };
	}

	if (key === Key.left || key === Key.leftArrow || key === Key.ctrlB) {
		return { cursor: Math.max(0, cursor - 1), value: fromCharacters(value), submitted: false, cancelled: false };
	}

	if (key === Key.right || key === Key.rightArrow || key === Key.ctrlF) {
		return { cursor: Math.min(value.length, cursor + 1), value: fromCharacters(value), submitted: false, cancelled: false };
	}

	if (oneOf([Key.home, Key.ctrlA], key)) {
		return { cursor: 0, value: fromCharacters(value), submitted: false, cancelled: false };
	}

	if (oneOf([Key.end, Key.ctrlE], key)) {
		return { cursor: value.length, value: fromCharacters(value), submitted: false, cancelled: false };
	}

	if (key === Key.delete) {
		value.splice(cursor, 1);

		return { cursor, value: fromCharacters(value), submitted: false, cancelled: false };
	}

	if (key === Key.backspace || key === Key.ctrlH) {
		if (cursor === 0) {
			return { cursor, value: fromCharacters(value), submitted: false, cancelled: false };
		}

		value.splice(cursor - 1, 1);

		return { cursor: cursor - 1, value: fromCharacters(value), submitted: false, cancelled: false };
	}

	if (key === Key.optionBackspace) {
		const before = fromCharacters(value.slice(0, cursor));
		const match = before.match(/(?:[\p{L}\p{M}\p{N}]+|[^\p{L}\p{M}\p{N}\s]+)\s*$/u);
		const start = match?.index ?? 0;

		value.splice(start, cursor - start);

		return { cursor: start, value: fromCharacters(value), submitted: false, cancelled: false };
	}

	if (isPrintable(key)) {
		for (const character of characters(key)) {
			value.splice(cursor, 0, character);
			cursor += 1;
		}
	}

	return { cursor, value: fromCharacters(value), submitted: false, cancelled: false };
};

export const readTypedValue = async (message: string, options: { default?: string; hint?: string; allowNewLine?: boolean } = {}): Promise<string> => {
	const environment = promptEnvironment();

	if (!environment.input.readKey) {
		if (!environment.input.readLine) {
			throw new PromptValidationError('The configured prompt input cannot read input.');
		}

		const answer = await environment.input.readLine(renderQuestion(message, options.hint));

		return answer === '' && options.default !== undefined ? options.default : answer;
	}

	environment.output.write(renderQuestion(message, options.hint));

	let state: TypedValueState = {
		cursor: options.default?.length ?? 0,
		value: options.default ?? '',
	};

	while (true) {
		const key = await environment.input.readKey();

		if (key === null) {
			return state.value;
		}

		const next = applyTypedKey(state, key, options.allowNewLine);

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
	}
};
