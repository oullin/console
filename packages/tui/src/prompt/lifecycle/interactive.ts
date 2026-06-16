import { promptEnvironment } from '#tui/environment';
import { validatedPromptValue } from '#tui/prompt/lifecycle/validation';
import { isPromptValidationError } from '#tui/prompt/validators/error';
import { parseInvalidPromptValue } from '#tui/prompt/validators/invalid';
import { renderError } from '#tui/theme';
import type { PromptInvalidHandler, PromptReader, PromptValidHandler } from '#tui/prompt/lifecycle/types';
import type { BasePromptOptions } from '#tui/types';

export const resolveInteractivePrompt = async <T>(options: BasePromptOptions<T>, read: PromptReader<T>, onValid?: PromptValidHandler<T>, onInvalid?: PromptInvalidHandler<T>): Promise<T> => {
	const environment = promptEnvironment();

	let attempt = 0;

	while (true) {
		let value: T;

		try {
			value = await read(attempt);
		} catch (error) {
			if (isPromptValidationError(error)) {
				await onInvalid?.(parseInvalidPromptValue<T>(error.value));

				environment.error.write(renderError(error.message));
				attempt += 1;
				continue;
			}

			await onInvalid?.();

			throw error;
		}

		const validation = await validatedPromptValue(options, value);

		if (!validation) {
			await onValid?.(value);

			return value;
		}

		await onInvalid?.(value);

		options.default = value;
		environment.error.write(renderError(validation));
		attempt += 1;
	}
};
