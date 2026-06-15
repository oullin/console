import { promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { cancelPrompt } from '#tui/prompt';
import { eraseRenderedFrame } from '#tui/status/frame';
import { applyTypedKey } from '#tui/typed-value';
import { resolveSearchChoices } from '#tui/prompts/search/choices';
import { clearsSearchHighlight, moveSearchHighlight, searchNavigationAction } from '#tui/prompts/search/keys';
import { initialRetriedSearchHighlight } from '#tui/prompts/search/navigation';
import { renderCancelledSearch, renderSearchChoices } from '#tui/prompts/search/render';
import { cancelledSearchValue, defaultSearchChoice, lineSearchValue, selectedSearchValue } from '#tui/prompts/search/read-single/result';
import type { SearchChoiceReadResult } from '#tui/prompts/search/read-single/result';
import type { SearchPromptOptions } from '#tui/types';

type SearchReadOptions<T> = SearchPromptOptions<T> & {
	hasDefault?: boolean;
};

export const readSearchChoice = async <T>(options: SearchReadOptions<T>, attempt = 0): Promise<SearchChoiceReadResult<T>> => {
	const environment = promptEnvironment();

	if (!environment.input.readKey) {
		return { cancelled: false, submitted: false, submittedLabel: '', value: await lineSearchValue(options) };
	}

	let state = { cursor: 0, value: '' };

	let choices = await resolveSearchChoices(options.options, state.value);

	let highlighted: number | null = initialRetriedSearchHighlight(choices, attempt);

	let frame = renderSearchChoices(options.message, state.value, state.cursor, choices, highlighted, new Set(), [], options.scroll, options.info, false, options.placeholder);

	while (true) {
		const key = await environment.input.readKey();

		if (key === null) {
			return { cancelled: false, submitted: false, submittedLabel: '', value: options.default };
		}

		if (key === Key.ctrlC) {
			eraseRenderedFrame(frame);
			renderCancelledSearch(options.message, state.value, options.placeholder);

			return { cancelled: true, submitted: false, submittedLabel: '', value: await cancelPrompt(cancelledSearchValue(choices, highlighted, options.default)) };
		}

		const action = searchNavigationAction(key, { controlNavigation: true, lineControls: true });

		if (action !== null && (action !== 'first' || highlighted !== null) && (action !== 'last' || highlighted !== null)) {
			choices = await resolveSearchChoices(options.options, state.value);

			highlighted = moveSearchHighlight(choices, highlighted, action, { attempt, retryFirst: true, scroll: options.scroll });
			eraseRenderedFrame(frame);
			frame = renderSearchChoices(options.message, state.value, state.cursor, choices, highlighted, new Set(), [], options.scroll, options.info, false, options.placeholder);
			continue;
		}

		if (clearsSearchHighlight(key) && highlighted !== null) {
			highlighted = null;
			eraseRenderedFrame(frame);
			frame = renderSearchChoices(options.message, state.value, state.cursor, choices, highlighted, new Set(), [], options.scroll, options.info, false, options.placeholder);
			continue;
		}

		if (key === Key.enter) {
			if (highlighted !== null) {
				const choice = choices[highlighted];
				const value = selectedSearchValue(choices, highlighted);

				return { cancelled: false, frame, submitted: choice !== undefined && value !== undefined, submittedLabel: choice?.label ?? '', value };
			}

			choices = await resolveSearchChoices(options.options, state.value);

			if (state.value === '' && options.hasDefault === true) {
				const choice = defaultSearchChoice(choices, options.default, options.hasDefault);

				return { cancelled: false, frame, submitted: choice !== undefined, submittedLabel: choice?.label ?? '', value: choice?.value ?? options.default };
			}

			highlighted = null;
			eraseRenderedFrame(frame);
			frame = renderSearchChoices(options.message, state.value, state.cursor, choices, highlighted, new Set(), [], options.scroll, options.info, false, options.placeholder);
			continue;
		}

		const next = applyTypedKey(state, key);

		if (next.cancelled) {
			eraseRenderedFrame(frame);
			renderCancelledSearch(options.message, state.value, options.placeholder);

			return { cancelled: true, submitted: false, submittedLabel: '', value: await cancelPrompt(options.default) };
		}

		state = { cursor: next.cursor, value: next.value };
		highlighted = null;

		choices = await resolveSearchChoices(options.options, state.value);

		eraseRenderedFrame(frame);
		frame = renderSearchChoices(options.message, state.value, state.cursor, choices, highlighted, new Set(), [], options.scroll, options.info, false, options.placeholder);
	}
};
