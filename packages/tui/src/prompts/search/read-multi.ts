import { promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { cancelMultiSearchChoices } from '#tui/prompts/search/read-multi/cancel';
import { applyMultiSearchKey } from '#tui/prompts/search/read-multi/keys';
import { lineMultiSearchValues, selectedSearchValues } from '#tui/prompts/search/read-multi/result';
import type { MultiSearchChoicesReadResult } from '#tui/prompts/search/read-multi/result';
import { createMultiSearchReaderSession } from '#tui/prompts/search/read-multi/session';
import type { MultiSearchPromptOptions } from '#tui/types';

export const readMultiSearchChoices = async <T>(options: MultiSearchPromptOptions<T>): Promise<MultiSearchChoicesReadResult<T>> => {
	const environment = promptEnvironment();

	if (!environment.input.readKey) {
		return { cancelled: false, submitted: false, submittedLabels: [], value: await lineMultiSearchValues(options) };
	}

	const session = await createMultiSearchReaderSession(options);

	session.render();

	while (true) {
		const key = await environment.input.readKey();

		if (key === null || key === Key.enter) {
			return { cancelled: false, frame: session.frame(), submitted: true, submittedLabels: session.selectedLabels(), value: selectedSearchValues(session.selected()) };
		}

		if (key === Key.ctrlC) {
			return cancelMultiSearchChoices(options, session);
		}

		if (await applyMultiSearchKey(key, session)) {
			continue;
		}

		const next = await session.applyTypedInput(key);

		if (next.cancelled) {
			return cancelMultiSearchChoices(options, session);
		}
	}
};
