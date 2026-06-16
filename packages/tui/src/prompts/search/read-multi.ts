import { promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { cancelPrompt } from '#tui/prompt';
import { eraseRenderedFrame } from '#tui/status/frame';
import { renderCancelledSearch } from '#tui/prompts/search/render';
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
			eraseRenderedFrame(session.frame());
			renderCancelledSearch(options.message, session.query().value, options.placeholder);

			return { cancelled: true, submitted: false, submittedLabels: session.selectedLabels(), value: await cancelPrompt(selectedSearchValues(session.selected())) };
		}

		if (await applyMultiSearchKey(key, session)) {
			continue;
		}

		const next = await session.applyTypedInput(key);

		if (next.cancelled) {
			eraseRenderedFrame(session.frame());
			renderCancelledSearch(options.message, session.query().value, options.placeholder);

			return { cancelled: true, submitted: false, submittedLabels: [], value: await cancelPrompt(options.default ?? []) };
		}
	}
};
