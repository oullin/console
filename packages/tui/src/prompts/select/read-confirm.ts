import { promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { cancelPrompt } from '#tui/prompt';
import { rejectPromptRevert } from '#tui/prompt/revert';
import { confirmDirectValue, isConfirmToggleKey } from '#tui/prompts/select/read-confirm/keys';
import { readLineConfirm } from '#tui/prompts/select/read-confirm/line-mode';
import { createConfirmReaderSession } from '#tui/prompts/select/read-confirm/session';
import type { ConfirmReadOptions, ConfirmReadResult } from '#tui/prompts/select/read-confirm/types';

export type { ConfirmReadOptions, ConfirmReadResult } from '#tui/prompts/select/read-confirm/types';

export const readConfirm = async (options: ConfirmReadOptions): Promise<ConfirmReadResult> => {
	const environment = promptEnvironment();

	if (!environment.input.readKey) {
		return readLineConfirm(options);
	}

	const session = createConfirmReaderSession(options);

	while (true) {
		const key = await environment.input.readKey();

		if (key === null) {
			const submitted = session.submission();

			return { cancelled: false, frame: submitted.frame, submitted: false, value: submitted.value };
		}

		const directValue = confirmDirectValue(key);

		if (directValue !== null) {
			session.set(directValue);
			continue;
		}

		if (isConfirmToggleKey(key)) {
			session.toggle();
			continue;
		}

		if (key === Key.enter) {
			const submitted = session.submission();

			return { cancelled: false, frame: submitted.frame, submitted: true, value: submitted.value };
		}

		if (key === Key.ctrlC) {
			session.cancel();

			return { cancelled: true, submitted: false, value: await cancelPrompt(session.value()) };
		}

		if (key === Key.ctrlU) {
			rejectPromptRevert();
			continue;
		}
	}
};
