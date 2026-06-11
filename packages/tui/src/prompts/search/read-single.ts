import { promptEnvironment } from '#tui/environment';
import { Key, oneOf } from '#tui/key';
import { ask } from '#tui/prompt';
import { applyTypedKey } from '#tui/typed-value';
import { resolveSearchChoices } from '#tui/prompts/search/choices';
import { resolveLineSearchChoice } from '#tui/prompts/search/line-mode';
import { firstSearchHighlight, lastSearchHighlight, nextRetriedSearchHighlight, nextSearchHighlight, pageSearchHighlight } from '#tui/prompts/search/navigation';
import { renderSearchChoices } from '#tui/prompts/search/render';
import type { SearchPromptOptions } from '#tui/types';

export const readSearchChoice = async <T>(options: SearchPromptOptions<T>, attempt = 0): Promise<T | undefined> => {
	const environment = promptEnvironment();

	if (!environment.input.readKey) {
		const query = (await ask(options.message, options.hint)).trim();

		return resolveLineSearchChoice(options, query);
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
			environment.error.write('Cancelled.\n');

			if (highlighted !== null) {
				const choice = choices[highlighted];

				return choice?.disabled ? options.default : (choice?.value ?? options.default);
			}

			return options.default;
		}

		if (key === Key.down || key === Key.downArrow || key === Key.ctrlN || key === Key.tab) {
			choices = await resolveSearchChoices(options.options, state.value);

			highlighted = nextRetriedSearchHighlight(choices, highlighted, attempt);
			renderSearchChoices(options.message, state.value, choices, highlighted, new Set(), [], options.scroll, options.info);
			continue;
		}

		if (key === Key.up || key === Key.upArrow || key === Key.ctrlP || key === Key.shiftTab) {
			choices = await resolveSearchChoices(options.options, state.value);

			highlighted = nextSearchHighlight(choices, highlighted, -1);
			renderSearchChoices(options.message, state.value, choices, highlighted, new Set(), [], options.scroll, options.info);
			continue;
		}

		if (key === Key.pageDown) {
			choices = await resolveSearchChoices(options.options, state.value);

			highlighted = pageSearchHighlight(choices, highlighted, 1, options.scroll);
			renderSearchChoices(options.message, state.value, choices, highlighted, new Set(), [], options.scroll, options.info);
			continue;
		}

		if (key === Key.pageUp) {
			choices = await resolveSearchChoices(options.options, state.value);

			highlighted = pageSearchHighlight(choices, highlighted, -1, options.scroll);
			renderSearchChoices(options.message, state.value, choices, highlighted, new Set(), [], options.scroll, options.info);
			continue;
		}

		if (oneOf([Key.home, Key.ctrlA], key) && highlighted !== null) {
			highlighted = firstSearchHighlight(choices);
			renderSearchChoices(options.message, state.value, choices, highlighted, new Set(), [], options.scroll, options.info);
			continue;
		}

		if (oneOf([Key.end, Key.ctrlE], key) && highlighted !== null) {
			highlighted = lastSearchHighlight(choices);
			renderSearchChoices(options.message, state.value, choices, highlighted, new Set(), [], options.scroll, options.info);
			continue;
		}

		if (oneOf([Key.left, Key.leftArrow, Key.right, Key.rightArrow, Key.ctrlB, Key.ctrlF], key) && highlighted !== null) {
			highlighted = null;
			renderSearchChoices(options.message, state.value, choices, highlighted, new Set(), [], options.scroll, options.info);
			continue;
		}

		if (key === Key.enter) {
			if (highlighted !== null) {
				const choice = choices[highlighted];

				return choice?.disabled ? undefined : choice?.value;
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
