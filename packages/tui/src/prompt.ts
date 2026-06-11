import { promptEnvironment } from '#tui/environment';
import { renderError, renderQuestion } from '#tui/theme';
import { requiredMessage } from '#tui/validators/required';
import type { BasePromptOptions, Validator } from '#tui/types';

export class PromptValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'PromptValidationError';
	}
}

export const validationMessage = async <T>(value: T, validator?: Validator<T>): Promise<string | undefined> => {
	const result = await validator?.(value);

	if (typeof result === 'string') {
		return result;
	}

	if (result === false) {
		return 'The given value is invalid.';
	}

	return undefined;
};

export const ensureRequired = <T>(value: T, required?: boolean | string): string | undefined => {
	return requiredMessage(value, required);
};

export const promptUntilValid = async <T>(options: BasePromptOptions<T>, read: (attempt: number) => Promise<T>): Promise<T> => {
	const environment = promptEnvironment();

	if (!environment.interactive) {
		const value = options.default as T;
		const required = ensureRequired(value, options.required);

		const validation = required ?? (await validationMessage(value, options.validate));

		if (validation) {
			throw new PromptValidationError(validation);
		}

		return value;
	}

	let attempt = 0;

	while (true) {
		let value: T;

		try {
			value = await read(attempt);
		} catch (error) {
			if (error instanceof PromptValidationError) {
				if (!environment.interactive) {
					throw error;
				}

				environment.error.write(renderError(error.message));
				attempt += 1;
				continue;
			}

			throw error;
		}

		const required = ensureRequired(value, options.required);

		const validation = required ?? (await validationMessage(value, options.validate));

		if (!validation) {
			return value;
		}

		if (!environment.interactive) {
			throw new PromptValidationError(validation);
		}

		environment.error.write(renderError(validation));
		attempt += 1;
	}
};

export const ask = async (message: string, hint?: string): Promise<string> => {
	const environment = promptEnvironment();

	if (!environment.input.readLine) {
		throw new PromptValidationError('The configured prompt input cannot read lines.');
	}

	return environment.input.readLine(renderQuestion(message, hint));
};
