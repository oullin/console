import { promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { ask, cancelPrompt } from '#tui/prompt';
import { rejectPromptRevert } from '#tui/prompt/revert';
import { renderActiveConfirm, renderCancelledConfirm, renderSubmittedConfirm } from '#tui/prompts/select/render-confirm';
import type { ConfirmPromptOptions } from '#tui/types';

const toggleKeys = new Set([Key.tab, Key.up, Key.upArrow, Key.down, Key.downArrow, Key.left, Key.leftArrow, Key.right, Key.rightArrow, Key.ctrlP, Key.ctrlF, Key.ctrlN, Key.ctrlB, 'h', 'j', 'k', 'l']);

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

	renderActiveConfirm(options, confirmed);

	while (true) {
		const key = await environment.input.readKey();

		if (key === null) {
			renderSubmittedConfirm(options, confirmed);

			return confirmed;
		}

		const normalizedKey = key.toLowerCase();

		if (normalizedKey === 'y') {
			confirmed = true;
			renderActiveConfirm(options, confirmed);
			continue;
		}

		if (normalizedKey === 'n') {
			confirmed = false;
			renderActiveConfirm(options, confirmed);
			continue;
		}

		if (toggleKeys.has(key)) {
			confirmed = !confirmed;
			renderActiveConfirm(options, confirmed);
			continue;
		}

		if (key === Key.enter) {
			renderSubmittedConfirm(options, confirmed);

			return confirmed;
		}

		if (key === Key.ctrlC) {
			renderCancelledConfirm(options, confirmed);

			return cancelPrompt(confirmed);
		}

		if (key === Key.ctrlU) {
			rejectPromptRevert();
			continue;
		}
	}
};
