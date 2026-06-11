import { promptEnvironment } from '#tui/environment';
import { Key, oneOf } from '#tui/key';
import { ask } from '#tui/prompt';
import { applyTypedKey } from '#tui/typed-value';
import { findChoice, firstEnabledIndex, nextEnabledIndex } from '#tui/concerns/choices';
import { lastEnabledIndex, resolveSearchChoices } from '#tui/prompts/search/choices';
import { renderSearchChoices } from '#tui/prompts/search/render';
import type { SearchPromptOptions } from '#tui/types';

export const readSearchChoice = async <T>(options: SearchPromptOptions<T>, attempt = 0): Promise<T | undefined> => {
	const environment = promptEnvironment();

	if (!environment.input.readKey) {
		const query = await ask(options.message, options.hint);

		const choices = await resolveSearchChoices(options.options, query);

		const choice = findChoice(choices, query) ?? choices.find((candidate) => !candidate.disabled);

		return choice?.value ?? options.default ?? choices[0]?.value;
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

		if (key === Key.down || key === Key.downArrow || key === Key.ctrlN || key === Key.tab) {
			choices = await resolveSearchChoices(options.options, state.value);

			highlighted =
				choices.length === 0
					? null
					: highlighted === null
						? attempt > 0
							? nextEnabledIndex(choices, firstEnabledIndex(choices), 1)
							: firstEnabledIndex(choices)
						: nextEnabledIndex(choices, highlighted, 1);
			renderSearchChoices(options.message, state.value, choices, highlighted, new Set(), [], options.scroll, options.info);
			continue;
		}

		if (key === Key.up || key === Key.upArrow || key === Key.ctrlP || key === Key.shiftTab) {
			choices = await resolveSearchChoices(options.options, state.value);

			highlighted = choices.length === 0 ? null : highlighted === null ? lastEnabledIndex(choices) : nextEnabledIndex(choices, highlighted, -1);
			renderSearchChoices(options.message, state.value, choices, highlighted, new Set(), [], options.scroll, options.info);
			continue;
		}

		if (oneOf([Key.home, Key.ctrlA], key) && highlighted !== null) {
			highlighted = firstEnabledIndex(choices);
			renderSearchChoices(options.message, state.value, choices, highlighted, new Set(), [], options.scroll, options.info);
			continue;
		}

		if (oneOf([Key.end, Key.ctrlE], key) && highlighted !== null) {
			highlighted = lastEnabledIndex(choices);
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
