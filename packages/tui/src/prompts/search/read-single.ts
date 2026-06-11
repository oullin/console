import { promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { applyTypedKey } from '#tui/typed-value';
import { resolveSearchChoices } from '#tui/prompts/search/choices';
import { clearsSearchHighlight, moveSearchHighlight, searchNavigationAction } from '#tui/prompts/search/keys';
import { renderSearchChoices, renderSubmittedSearchChoice } from '#tui/prompts/search/render';
import { cancelledSearchValue, lineSearchValue, selectedSearchValue } from '#tui/prompts/search/read-single/result';
import type { SearchPromptOptions } from '#tui/types';

export const readSearchChoice = async <T>(options: SearchPromptOptions<T>, attempt = 0): Promise<T | undefined> => {
	const environment = promptEnvironment();

	if (!environment.input.readKey) {
		return lineSearchValue(options);
	}

	let state = { cursor: 0, value: '' };

	let choices = await resolveSearchChoices(options.options, state.value);

	let highlighted: number | null = null;

	renderSearchChoices(options.message, state.value, choices, highlighted, new Set(), [], options.scroll, options.info);

	while (true) {
		const key = await environment.input.readKey();

		if (key === null) {
			return options.default;
		}

		if (key === Key.ctrlC) {
			return cancelledSearchValue(choices, highlighted, options.default);
		}

		const action = searchNavigationAction(key, { controlNavigation: true, lineControls: true });

		if (action !== null && (action !== 'first' || highlighted !== null) && (action !== 'last' || highlighted !== null)) {
			choices = await resolveSearchChoices(options.options, state.value);

			highlighted = moveSearchHighlight(choices, highlighted, action, { attempt, retryFirst: true, scroll: options.scroll });
			renderSearchChoices(options.message, state.value, choices, highlighted, new Set(), [], options.scroll, options.info);
			continue;
		}

		if (clearsSearchHighlight(key) && highlighted !== null) {
			highlighted = null;
			renderSearchChoices(options.message, state.value, choices, highlighted, new Set(), [], options.scroll, options.info);
			continue;
		}

		if (key === Key.enter) {
			if (highlighted !== null) {
				const choice = choices[highlighted];
				const value = selectedSearchValue(choices, highlighted);

				if (choice && value !== undefined) {
					renderSubmittedSearchChoice(options.message, choice.label);
				}

				return value;
			}

			choices = await resolveSearchChoices(options.options, state.value);

			highlighted = null;
			renderSearchChoices(options.message, state.value, choices, highlighted, new Set(), [], options.scroll, options.info);
			continue;
		}

		const next = applyTypedKey(state, key);

		if (next.cancelled) {
			environment.error.write('Cancelled.\n');

			return options.default;
		}

		state = { cursor: next.cursor, value: next.value };
		highlighted = null;

		choices = await resolveSearchChoices(options.options, state.value);

		renderSearchChoices(options.message, state.value, choices, highlighted, new Set(), [], options.scroll, options.info);
	}
};
