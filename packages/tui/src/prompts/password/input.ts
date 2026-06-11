import { promptEnvironment } from '#tui/environment';
import { PromptValidationError } from '#tui/prompt';
import { renderQuestion } from '#tui/theme';
import { applyTypedKey } from '#tui/typed-value';

type PasswordInputOptions = {
	hint?: string;
	placeholder?: string;
};

const mask = (value: string): string => '•'.repeat([...value].length);

const renderPasswordValue = (message: string, stateValue: string, options: PasswordInputOptions): void => {
	const value = stateValue.length > 0 ? mask(stateValue) : (options.placeholder ?? '');

	promptEnvironment().output.write(`${renderQuestion(message, options.hint)}${value}\n`);
};

export const readPasswordValue = async (message: string, options: PasswordInputOptions = {}): Promise<string> => {
	const environment = promptEnvironment();

	if (!environment.input.readKey) {
		if (!environment.input.readLine) {
			throw new PromptValidationError('The configured prompt input cannot read input.');
		}

		return environment.input.readLine(renderQuestion(message, options.hint));
	}

	let state = {
		cursor: 0,
		value: '',
	};

	renderPasswordValue(message, state.value, options);

	while (true) {
		const key = await environment.input.readKey();

		if (key === null) {
			return state.value;
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

		renderPasswordValue(message, state.value, options);
	}
};
