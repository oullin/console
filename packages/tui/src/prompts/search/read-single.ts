import { promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { cancelPrompt } from '#tui/prompt';
import { applyTypedKey } from '#tui/typed-value';
import { resolveSearchChoices } from '#tui/prompts/search/choices';
import { clearsSearchHighlight, moveSearchHighlight, searchNavigationAction } from '#tui/prompts/search/keys';
import { renderCancelledSearch, renderSearchChoices } from '#tui/prompts/search/render';
import { cancelledSearchValue, defaultSearchChoice, lineSearchValue, selectedSearchValue } from '#tui/prompts/search/read-single/result';
import type { SearchChoiceReadResult } from '#tui/prompts/search/read-single/result';
import type { SearchPromptOptions } from '#tui/types';

export const readSearchChoice = async <T>(options: SearchPromptOptions<T>, attempt = 0): Promise<SearchChoiceReadResult<T>> => {
	const environment = promptEnvironment();

	if (!environment.input.readKey) {
		return { cancelled: false, submitted: false, submittedLabel: '', value: await lineSearchValue(options) };
	}

	let state = { cursor: 0, value: '' };

	let choices = await resolveSearchChoices(options.options, state.value);

	let highlighted: number | null = null;

	renderSearchChoices(options.message, state.value, choices, highlighted, new Set(), [], options.scroll, options.info, false, options.placeholder);

	while (true) {
		const key = await environment.input.readKey();

		if (key === null) {
			return { cancelled: false, submitted: false, submittedLabel: '', value: options.default };
		}

		if (key === Key.ctrlC) {
			renderCancelledSearch(options.message, state.value, options.placeholder);

			return { cancelled: true, submitted: false, submittedLabel: '', value: await cancelPrompt(cancelledSearchValue(choices, highlighted, options.default)) };
		}

		const action = searchNavigationAction(key, { controlNavigation: true, lineControls: true });

		if (action !== null && (action !== 'first' || highlighted !== null) && (action !== 'last' || highlighted !== null)) {
			choices = await resolveSearchChoices(options.options, state.value);

			highlighted = moveSearchHighlight(choices, highlighted, action, { attempt, retryFirst: true, scroll: options.scroll });
			renderSearchChoices(options.message, state.value, choices, highlighted, new Set(), [], options.scroll, options.info, false, options.placeholder);
			continue;
		}

		if (clearsSearchHighlight(key) && highlighted !== null) {
			highlighted = null;
			renderSearchChoices(options.message, state.value, choices, highlighted, new Set(), [], options.scroll, options.info, false, options.placeholder);
			continue;
		}

		if (key === Key.enter) {
			if (highlighted !== null) {
				const choice = choices[highlighted];
				const value = selectedSearchValue(choices, highlighted);

				return { cancelled: false, submitted: choice !== undefined && value !== undefined, submittedLabel: choice?.label ?? '', value };
			}

			choices = await resolveSearchChoices(options.options, state.value);

			if (state.value === '' && options.default !== undefined) {
				const choice = defaultSearchChoice(choices, options.default);

				return { cancelled: false, submitted: choice !== undefined, submittedLabel: choice?.label ?? '', value: choice?.value ?? options.default };
			}

			highlighted = null;
			renderSearchChoices(options.message, state.value, choices, highlighted, new Set(), [], options.scroll, options.info, false, options.placeholder);
			continue;
		}

		const next = applyTypedKey(state, key);

		if (next.cancelled) {
			renderCancelledSearch(options.message, state.value, options.placeholder);

			return { cancelled: true, submitted: false, submittedLabel: '', value: await cancelPrompt(options.default) };
		}

		state = { cursor: next.cursor, value: next.value };
		highlighted = null;

		choices = await resolveSearchChoices(options.options, state.value);

		renderSearchChoices(options.message, state.value, choices, highlighted, new Set(), [], options.scroll, options.info, false, options.placeholder);
	}
};
