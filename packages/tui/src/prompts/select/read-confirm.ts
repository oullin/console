import { promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { ask, cancelPrompt } from '#tui/prompt';
import { renderQuestion } from '#tui/theme';
import type { ConfirmPromptOptions } from '#tui/types';

const toggleKeys = new Set([Key.tab, Key.up, Key.upArrow, Key.down, Key.downArrow, Key.left, Key.leftArrow, Key.right, Key.rightArrow, Key.ctrlP, Key.ctrlF, Key.ctrlN, Key.ctrlB, 'h', 'j', 'k', 'l']);

const renderConfirm = (options: ConfirmPromptOptions, confirmed: boolean): void => {
	const yes = confirmed ? `[${options.yes ?? 'Yes'}]` : ` ${options.yes ?? 'Yes'} `;
	const no = confirmed ? ` ${options.no ?? 'No'} ` : `[${options.no ?? 'No'}]`;

	promptEnvironment().output.write(`${renderQuestion(options.message, options.hint)}${yes} / ${no}\n`);
};

export const readConfirm = async (options: ConfirmPromptOptions): Promise<boolean> => {
	const environment = promptEnvironment();

	if (!environment.input.readKey) {
		const suffix = options.default === false ? ' [y/N]' : ' [Y/n]';

		const answer = (await ask(`${options.message}${suffix}`, options.hint)).trim().toLowerCase();

		if (answer === '' && options.default !== undefined) {
			return options.default;
		}

		return ['y', 'yes', options.yes?.toLowerCase()].includes(answer);
	}

	let confirmed = options.default ?? true;

	renderConfirm(options, confirmed);

	while (true) {
		const key = await environment.input.readKey();

		if (key === null) {
			return confirmed;
		}

		const normalizedKey = key.toLowerCase();

		if (normalizedKey === 'y') {
			confirmed = true;
			renderConfirm(options, confirmed);
			continue;
		}

		if (normalizedKey === 'n') {
			confirmed = false;
			renderConfirm(options, confirmed);
			continue;
		}

		if (toggleKeys.has(key)) {
			confirmed = !confirmed;
			renderConfirm(options, confirmed);
			continue;
		}

		if (key === Key.enter) {
			return confirmed;
		}

		if (key === Key.ctrlC) {
			environment.error.write('Cancelled.\n');

			return cancelPrompt(confirmed);
		}
	}
};
