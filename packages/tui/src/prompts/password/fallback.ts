import { promptEnvironment } from '#tui/environment';
import { PromptValidationError } from '#tui/prompt';
import { renderQuestion } from '#tui/theme';
import type { PasswordInputOptions, PasswordReadResult } from '#tui/prompts/password/types';

export const readPasswordFallbackValue = async (message: string, options: PasswordInputOptions): Promise<PasswordReadResult> => {
	const environment = promptEnvironment();

	if (!environment.input.readLine) {
		throw new PromptValidationError('The configured prompt input cannot read input.');
	}

	const answer = await environment.input.readLine(renderQuestion(message, options.hint));

	return {
		cancelled: false,
		value: answer === '' && options.default !== undefined ? options.default : answer,
	};
};
