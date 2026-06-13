import { promptEnvironment } from '#tui/environment';
import { PromptValidationError } from '#tui/prompt/error';
import { ensureRequired, validationMessage } from '#tui/prompt/validation';
import { renderError } from '#tui/theme';
import type { BasePromptOptions } from '#tui/types';

type PromptReader<T> = (attempt: number) => Promise<T>;

type PromptValidHandler<T> = (value: T) => void | Promise<void>;

const validatedPromptValue = async <T>(options: BasePromptOptions<T>, value: T): Promise<string | undefined> => {
	return ensureRequired(value, options.required) ?? (await validationMessage(value, options.validate, options));
};

export const promptUntilValid = async <T>(options: BasePromptOptions<T>, read: PromptReader<T>, onValid?: PromptValidHandler<T>): Promise<T> => {
	const environment = promptEnvironment();

	if (!environment.interactive) {
		const value = options.default as T;

		const validation = await validatedPromptValue(options, value);

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
				environment.error.write(renderError(error.message));
				attempt += 1;
				continue;
			}

			throw error;
		}

		const validation = await validatedPromptValue(options, value);

		if (!validation) {
			await onValid?.(value);

			return value;
		}

		options.default = value;
		environment.error.write(renderError(validation));
		attempt += 1;
	}
};
