import { Key } from '#tui/key';
import { cancelPrompt } from '#tui/prompt';
import { eraseRenderedFrame } from '#tui/status/frame';
import { clearsSearchHighlight, searchNavigationAction } from '#tui/prompts/search/keys';
import { renderCancelledSearch } from '#tui/prompts/search/render';
import { cancelledSearchValue } from '#tui/prompts/search/read-single/result';
import { createSearchReaderSession } from '#tui/prompts/search/read-single/session';
import type { SearchChoiceReadResult } from '#tui/prompts/search/read-single/result';
import type { SearchReadOptions } from '#tui/prompts/search/read-single/types';
import type { PromptInput } from '#tui/types';

export const readSearchChoiceInteractive = async <T>(readKey: NonNullable<PromptInput['readKey']>, options: SearchReadOptions<T>, attempt: number): Promise<SearchChoiceReadResult<T>> => {
	const session = await createSearchReaderSession(options, attempt);

	session.render();

	while (true) {
		const key = await readKey();

		if (key === null) {
			return { cancelled: false, submitted: false, submittedLabel: '', value: options.default };
		}

		if (key === Key.ctrlC) {
			eraseRenderedFrame(session.frame());
			renderCancelledSearch(options.message, session.query().value, options.placeholder);

			return { cancelled: true, submitted: false, submittedLabel: '', value: await cancelPrompt(cancelledSearchValue(session.choices(), session.highlighted(), options.default)) };
		}

		const action = searchNavigationAction(key, { controlNavigation: true, lineControls: true });

		if (action !== null && (action !== 'first' || session.highlighted() !== null) && (action !== 'last' || session.highlighted() !== null)) {
			await session.move(action);

			continue;
		}

		if (clearsSearchHighlight(key) && session.highlighted() !== null) {
			session.clearHighlight();
			continue;
		}

		if (key === Key.enter) {
			if (session.highlighted() !== null) {
				const selected = session.selectedSelection();

				return { cancelled: false, frame: session.frame(), submitted: selected.submitted, submittedLabel: selected.label, value: selected.value };
			}

			const selected = await session.defaultSelection();

			if (session.query().value === '' && options.hasDefault === true) {
				return { cancelled: false, frame: session.frame(), submitted: selected.submitted, submittedLabel: selected.label, value: selected.value };
			}

			session.clearHighlight();
			continue;
		}

		const next = await session.applyTypedInput(key);

		if (next.cancelled) {
			eraseRenderedFrame(session.frame());
			renderCancelledSearch(options.message, session.query().value, options.placeholder);

			return { cancelled: true, submitted: false, submittedLabel: '', value: await cancelPrompt(options.default) };
		}
	}
};
