import { promptEnvironment } from '#tui/environment';
import { Key, oneOf } from '#tui/key';
import { ask } from '#tui/prompt';
import { applyTypedKey } from '#tui/typed-value';
import { resolveSearchChoices } from '#tui/prompts/search/choices';
import { resolveLineMultiSearchChoices } from '#tui/prompts/search/line-mode';
import { firstSearchHighlight, lastSearchHighlight, nextSearchHighlight, pageSearchHighlight } from '#tui/prompts/search/navigation';
import { renderSearchChoices } from '#tui/prompts/search/render';
import type { Choice, MultiSearchPromptOptions } from '#tui/types';

export const readMultiSearchChoices = async <T>(options: MultiSearchPromptOptions<T>): Promise<T[]> => {
	const environment = promptEnvironment();

	if (!environment.input.readKey) {
		const query = (await ask(options.message, options.hint)).trim();

		return resolveLineMultiSearchChoices(options, query);
	}

	let state = { cursor: 0, value: '' };

	let choices = await resolveSearchChoices(options.options, state.value);

	let highlighted: number | null = null;

	const selected = initialSelectedValues(choices, options.default);

	const displayedChoices = (): Array<Choice<T>> => {
		if (state.value.trim() !== '') {
			return choices;
		}

		const selectedChoices = [...selected.entries()].filter(([value]) => !choices.some((choice) => Object.is(choice.value, value))).map(([value, label]) => ({ label, value }));

		return [...selectedChoices, ...choices];
	};

	const selectableChoices = (): Array<Choice<T>> => displayedChoices().filter((choice) => !choice.disabled);

	const render = (): void => {
		const currentChoices = displayedChoices();
		const marked = new Set(currentChoices.flatMap((choice, index) => (selected.has(choice.value) ? [index] : [])));

		renderSearchChoices(options.message, state.value, currentChoices, highlighted, marked, [...selected.values()], options.scroll, options.info, true);
	};

	render();

	while (true) {
		const key = await environment.input.readKey();

		if (key === null || key === Key.enter) {
			return [...selected.keys()];
		}

		if (key === Key.ctrlC) {
			environment.error.write('Cancelled.\n');

			return [...selected.keys()];
		}

		if (key === Key.down || key === Key.downArrow || key === Key.tab) {
			choices = await resolveSearchChoices(options.options, state.value);

			const currentChoices = displayedChoices();

			highlighted = nextSearchHighlight(currentChoices, highlighted, 1);
			render();
			continue;
		}

		if (key === Key.up || key === Key.upArrow || key === Key.shiftTab) {
			choices = await resolveSearchChoices(options.options, state.value);

			const currentChoices = displayedChoices();

			highlighted = nextSearchHighlight(currentChoices, highlighted, -1);
			render();
			continue;
		}

		if (key === Key.pageDown) {
			choices = await resolveSearchChoices(options.options, state.value);

			const currentChoices = displayedChoices();

			highlighted = pageSearchHighlight(currentChoices, highlighted, 1, options.scroll);
			render();
			continue;
		}

		if (key === Key.pageUp) {
			choices = await resolveSearchChoices(options.options, state.value);

			const currentChoices = displayedChoices();

			highlighted = pageSearchHighlight(currentChoices, highlighted, -1, options.scroll);
			render();
			continue;
		}

		if (oneOf([Key.home], key) && highlighted !== null) {
			highlighted = firstSearchHighlight(displayedChoices());
			render();
			continue;
		}

		if (oneOf([Key.end], key) && highlighted !== null) {
			highlighted = lastSearchHighlight(displayedChoices());
			render();
			continue;
		}

		if (key === Key.ctrlE && highlighted !== null) {
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
			const choice = displayedChoices()[highlighted];

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

const initialSelectedValues = <T>(choices: Array<Choice<T>>, defaults: T[] = []): Map<T, string> => {
	const selected = new Map<T, string>();

	for (const value of defaults) {
		const choice = choices.find((candidate) => Object.is(candidate.value, value));

		selected.set(value, choice?.label ?? String(value));
	}

	return selected;
};
