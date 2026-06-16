import { promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { cancelPrompt, PromptValidationError } from '#tui/prompt';
import { renderQuestion } from '#tui/theme';
import { createNumberReaderSession } from '#tui/prompts/number/session';
import type { NumberInputOptions } from '#tui/prompts/number/types';

export type NumberReadResult = {
	cancelled: boolean;
	frame?: string;
	value: string;
};

export const readNumberValue = async (message: string, options: NumberInputOptions = {}): Promise<NumberReadResult> => {
	const environment = promptEnvironment();

	if (!environment.input.readKey) {
		if (!environment.input.readLine) {
			throw new PromptValidationError('The configured prompt input cannot read input.');
		}

		const answer = await environment.input.readLine(renderQuestion(message, options.hint));

		return {
			cancelled: false,
			value: answer === '' && options.hasDefault ? String(options.default) : answer,
		};
	}

	const session = createNumberReaderSession(message, options);

	while (true) {
		const key = await environment.input.readKey();

		if (key === null) {
			return {
				cancelled: false,
				frame: session.frame(),
				value: session.value(),
			};
		}

		if (key === Key.up || key === Key.upArrow) {
			session.step(1);
			continue;
		}

		if (key === Key.down || key === Key.downArrow) {
			session.step(-1);
			continue;
		}

		const next = session.applyTypedInput(key);

		if (next.cancelled) {
			session.cancel();

			return {
				cancelled: true,
				value: await cancelPrompt(session.value()),
			};
		}

		if (next.submitted) {
			return {
				cancelled: false,
				frame: session.frame(),
				value: session.value(),
			};
		}
	}
};
