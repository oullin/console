import { promptEnvironment } from '#tui/environment';
import { PromptValidationError } from '#tui/prompt/error';
import { renderQuestion } from '#tui/theme';

export const ask = async (message: string, hint?: string): Promise<string> => {
	const environment = promptEnvironment();

	if (!environment.input.readLine) {
		throw new PromptValidationError('The configured prompt input cannot read lines.');
	}

	return environment.input.readLine(renderQuestion(message, hint));
};
