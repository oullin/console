import { promptEnvironment } from '#tui/environment';
import { Key, oneOf } from '#tui/key';
import { ask, PromptValidationError } from '#tui/prompt';
import { applyTypedKey } from '#tui/typed-value';
import { findChoice, firstEnabledIndex, nextEnabledIndex } from '#tui/concerns/choices';
import { lastEnabledIndex, resolveSearchChoices } from '#tui/prompts/search/choices';
import { renderSearchChoices } from '#tui/prompts/search/render';
import type { Choice, MultiSearchPromptOptions } from '#tui/types';

export const readMultiSearchChoices = async <T>(options: MultiSearchPromptOptions<T>): Promise<T[]> => {
	const environment = promptEnvironment();

	if (!environment.input.readKey) {
		const query = await ask(options.message, options.hint);

		const choices = await resolveSearchChoices(options.options, query);

		if (query.trim() === '' && options.default !== undefined) {
			return options.default;
		}

		const parts = query
			.split(',')
			.map((part) => part.trim())
			.filter((part) => part.length > 0);

		const selectedChoices = parts.map((part) => findChoice(choices, part)).filter((choice): choice is Choice<T> => choice !== undefined && !choice.disabled);

		if (selectedChoices.length !== parts.length) {
			throw new PromptValidationError('Please select valid options.');
		}

		return selectedChoices.map((choice) => choice.value);
	}

	let state = { cursor: 0, value: '' };

	let choices = await resolveSearchChoices(options.options, state.value);

	let highlighted: number | null = null;

	const selected = new Map<T, string>();
	const selectableChoices = (): Array<Choice<T>> => choices.filter((choice) => !choice.disabled);

	const render = (): void => {
		const marked = new Set(choices.flatMap((choice, index) => (selected.has(choice.value) ? [index] : [])));

		renderSearchChoices(options.message, state.value, choices, highlighted, marked, [...selected.values()], options.scroll, options.info);
	};

	render();

	while (true) {
		const key = await environment.input.readKey();

		if (key === null || key === Key.enter) {
			return [...selected.keys()];
		}

		if (key === Key.down || key === Key.downArrow || key === Key.ctrlN || key === Key.tab) {
			choices = await resolveSearchChoices(options.options, state.value);

			highlighted = choices.length === 0 ? null : highlighted === null ? firstEnabledIndex(choices) : nextEnabledIndex(choices, highlighted, 1);
			render();
			continue;
		}

		if (key === Key.up || key === Key.upArrow || key === Key.ctrlP || key === Key.shiftTab) {
			choices = await resolveSearchChoices(options.options, state.value);

			highlighted = choices.length === 0 ? null : highlighted === null ? lastEnabledIndex(choices) : nextEnabledIndex(choices, highlighted, -1);
			render();
			continue;
		}

		if (oneOf([Key.home], key) && highlighted !== null) {
			highlighted = firstEnabledIndex(choices);
			render();
			continue;
		}

		if (oneOf([Key.end], key) && highlighted !== null) {
			highlighted = lastEnabledIndex(choices);
			render();
			continue;
		}

		if (key === Key.ctrlE && highlighted !== null) {
			render();
			continue;
		}

		if (key === Key.ctrlA && highlighted !== null) {
			const currentChoices = selectableChoices();
			const allCurrentChoicesSelected = currentChoices.every((choice) => selected.has(choice.value));

			if (allCurrentChoicesSelected) {
				for (const choice of currentChoices) {
					selected.delete(choice.value);
				}
			} else {
				for (const choice of currentChoices) {
					selected.set(choice.value, choice.label);
				}
			}

			render();
			continue;
		}

		if (key === Key.space && highlighted !== null) {
			const choice = choices[highlighted];

			if (choice && !choice.disabled) {
				if (selected.has(choice.value as T)) {
					selected.delete(choice.value as T);
				} else {
					selected.set(choice.value as T, choice.label);
				}
			}

			render();
			continue;
		}

		const next = applyTypedKey(state, key);

		if (next.cancelled) {
			environment.error.write('Cancelled.\n');

			return options.default ?? [];
		}

		state = { cursor: next.cursor, value: next.value };

		choices = await resolveSearchChoices(options.options, state.value);

		highlighted = null;
		render();
	}
};
