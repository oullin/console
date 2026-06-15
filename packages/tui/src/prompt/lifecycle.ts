import { promptEnvironment } from '#tui/environment';
import { resolveInteractivePrompt } from '#tui/prompt/lifecycle/interactive';
import { resolveNonInteractivePrompt } from '#tui/prompt/lifecycle/non-interactive';
import type { PromptInvalidHandler, PromptReader, PromptValidHandler } from '#tui/prompt/lifecycle/types';
import type { BasePromptOptions } from '#tui/types';

export const promptUntilValid = async <T>(options: BasePromptOptions<T>, read: PromptReader<T>, onValid?: PromptValidHandler<T>, onInvalid?: PromptInvalidHandler<T>): Promise<T> => {
	const environment = promptEnvironment();

	if (!environment.interactive) {
		return resolveNonInteractivePrompt(options);
	}

	return resolveInteractivePrompt(options, read, onValid, onInvalid);
};
