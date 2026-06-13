import { promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { ask, cancelPrompt } from '#tui/prompt';
import { rejectPromptRevert } from '#tui/prompt/revert';
import { eraseRenderedFrame } from '#tui/status/frame';
import { renderActiveConfirm, renderCancelledConfirm } from '#tui/prompts/select/render-confirm';
import type { ConfirmPromptOptions } from '#tui/types';

const toggleKeys = new Set([Key.tab, Key.up, Key.upArrow, Key.down, Key.downArrow, Key.left, Key.leftArrow, Key.right, Key.rightArrow, Key.ctrlP, Key.ctrlF, Key.ctrlN, Key.ctrlB, 'h', 'j', 'k', 'l']);

export type ConfirmReadResult = {
	cancelled: boolean;
	frame?: string;
	submitted: boolean;
	value: boolean;
};

export const readConfirm = async (options: ConfirmPromptOptions): Promise<ConfirmReadResult> => {
	const environment = promptEnvironment();

	if (!environment.input.readKey) {
		const suffix = options.default === false ? ' [y/N]' : ' [Y/n]';

		const answer = (await ask(`${options.message}${suffix}`, options.hint)).trim().toLowerCase();

		if (answer === '' && options.default !== undefined) {
			return { cancelled: false, submitted: false, value: options.default };
		}

		return { cancelled: false, submitted: false, value: ['y', 'yes', options.yes?.toLowerCase()].includes(answer) };
	}

	let confirmed = options.default ?? true;

	let frame = renderActiveConfirm(options, confirmed);

	while (true) {
		const key = await environment.input.readKey();

		if (key === null) {
			return { cancelled: false, frame, submitted: true, value: confirmed };
		}

		const normalizedKey = key.toLowerCase();

		if (normalizedKey === 'y') {
			confirmed = true;
			eraseRenderedFrame(frame);
			frame = renderActiveConfirm(options, confirmed);
			continue;
		}

		if (normalizedKey === 'n') {
			confirmed = false;
			eraseRenderedFrame(frame);
			frame = renderActiveConfirm(options, confirmed);
			continue;
		}

		if (toggleKeys.has(key)) {
			confirmed = !confirmed;
			eraseRenderedFrame(frame);
			frame = renderActiveConfirm(options, confirmed);
			continue;
		}

		if (key === Key.enter) {
			return { cancelled: false, frame, submitted: true, value: confirmed };
		}

		if (key === Key.ctrlC) {
			eraseRenderedFrame(frame);
			renderCancelledConfirm(options, confirmed);

			return { cancelled: true, submitted: false, value: await cancelPrompt(confirmed) };
		}

		if (key === Key.ctrlU) {
			rejectPromptRevert();
			continue;
		}
	}
};
