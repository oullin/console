import { promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { ask, cancelPrompt } from '#tui/prompt';
import { renderChoices } from '#tui/theme';
import { firstEnabledIndex } from '#tui/concerns/choices';
import { moveSelectHighlight, selectNavigationAction } from '#tui/prompts/select/keys';
import { choicesFromCommaSeparated, markedChoiceIndexes, markedChoiceValues, toggleAllEnabledChoices, toggleMarkedChoice } from '#tui/prompts/select/multiple';
import { parseChoiceIndex } from '#tui/prompts/select/navigation';
import { renderCancelledChoices, renderMultipleChoices } from '#tui/prompts/select/render';
import type { Choice, MultiSelectPromptOptions } from '#tui/types';

export type MultipleChoicesReadResult<T> = {
	cancelled: boolean;
	submitted: boolean;
	submittedLabels: string[];
	value: T[];
};

const markedChoiceLabels = <T>(choices: Array<Choice<T>>, marked: Set<number>): string[] => {
	return [...marked]
		.sort((left, right) => left - right)
		.map((index) => choices[index]?.label)
		.filter((label): label is string => label !== undefined);
};

export const readMultipleChoices = async <T>(
	message: string,
	choices: Array<Choice<T>>,
	defaults: T[] = [],
	hint?: string,
	scroll?: number,
	info?: MultiSelectPromptOptions<T>['info'],
): Promise<MultipleChoicesReadResult<T>> => {
	const environment = promptEnvironment();

	if (!environment.input.readKey) {
		const rendered = renderChoices(choices);

		const answer = await ask(`${message}\n${rendered}\n`, hint);

		const value = answer.trim() === '' ? defaults : choicesFromCommaSeparated(choices, answer);

		return { cancelled: false, submitted: false, submittedLabels: [], value };
	}

	let selected = firstEnabledIndex(choices);

	let marked = markedChoiceIndexes(choices, defaults);

	renderMultipleChoices(message, choices, selected, marked, scroll, info);

	while (true) {
		const key = await environment.input.readKey();

		if (key === null) {
			return { cancelled: false, submitted: true, submittedLabels: markedChoiceLabels(choices, marked), value: markedChoiceValues(choices, marked) };
		}

		if (key === Key.ctrlC) {
			renderCancelledChoices(message, choices, selected, marked, scroll);

			return { cancelled: true, submitted: false, submittedLabels: markedChoiceLabels(choices, marked), value: await cancelPrompt(markedChoiceValues(choices, marked)) };
		}

		if (key.includes(',')) {
			return { cancelled: false, submitted: false, submittedLabels: [], value: choicesFromCommaSeparated(choices, key) };
		}

		const numeric = parseChoiceIndex(key);

		if (!Number.isNaN(numeric) && choices[numeric - 1] && !choices[numeric - 1]?.disabled) {
			const index = numeric - 1;

			if (marked.has(index)) {
				marked.delete(index);
			} else {
				marked.add(index);
			}

			renderMultipleChoices(message, choices, selected, marked, scroll, info);
			continue;
		}

		const action = selectNavigationAction(key);

		if (action !== null) {
			selected = moveSelectHighlight(choices, selected, action, scroll);
			renderMultipleChoices(message, choices, selected, marked, scroll, info);
			continue;
		}

		if (key === Key.ctrlA) {
			marked = toggleAllEnabledChoices(choices, marked);

			renderMultipleChoices(message, choices, selected, marked, scroll, info);
			continue;
		}

		if (key === Key.space) {
			marked = toggleMarkedChoice(choices, marked, selected);

			renderMultipleChoices(message, choices, selected, marked, scroll, info);
			continue;
		}

		if (key === Key.enter) {
			return { cancelled: false, submitted: true, submittedLabels: markedChoiceLabels(choices, marked), value: markedChoiceValues(choices, marked) };
		}
	}
};
