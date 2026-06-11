import { promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { ask, cancelPrompt } from '#tui/prompt';
import { renderChoices } from '#tui/theme';
import { firstEnabledIndex } from '#tui/concerns/choices';
import { moveSelectHighlight, selectNavigationAction } from '#tui/prompts/select/keys';
import { choicesFromCommaSeparated, markedChoiceIndexes, markedChoiceValues, toggleAllEnabledChoices, toggleMarkedChoice } from '#tui/prompts/select/multiple';
import { parseChoiceIndex } from '#tui/prompts/select/navigation';
import { renderCancelledChoices, renderMultipleChoices, renderSubmittedChoices } from '#tui/prompts/select/render';
import type { Choice, MultiSelectPromptOptions } from '#tui/types';

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
): Promise<T[]> => {
	const environment = promptEnvironment();

	if (!environment.input.readKey) {
		const rendered = renderChoices(choices);

		const answer = await ask(`${message}\n${rendered}\n`, hint);

		return answer.trim() === '' ? defaults : choicesFromCommaSeparated(choices, answer);
	}

	let selected = firstEnabledIndex(choices);

	let marked = markedChoiceIndexes(choices, defaults);

	renderMultipleChoices(message, choices, selected, marked, scroll, info);

	while (true) {
		const key = await environment.input.readKey();

		if (key === null) {
			renderSubmittedChoices(message, markedChoiceLabels(choices, marked));

			return markedChoiceValues(choices, marked);
		}

		if (key === Key.ctrlC) {
			renderCancelledChoices(message, choices, selected, marked, scroll);

			return cancelPrompt(markedChoiceValues(choices, marked));
		}

		if (key.includes(',')) {
			return choicesFromCommaSeparated(choices, key);
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
			renderSubmittedChoices(message, markedChoiceLabels(choices, marked));

			return markedChoiceValues(choices, marked);
		}
	}
};
