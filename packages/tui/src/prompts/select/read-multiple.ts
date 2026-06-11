import { promptEnvironment } from '#tui/environment';
import { Key, oneOf } from '#tui/key';
import { ask, PromptValidationError } from '#tui/prompt';
import { renderChoices } from '#tui/theme';
import { findChoice, firstEnabledIndex, nextEnabledIndex } from '#tui/concerns/choices';
import { lastEnabledChoiceIndex, nextChoiceKeys, pageEnabledChoiceIndex, parseChoiceIndex, previousChoiceKeys } from '#tui/prompts/select/navigation';
import { renderMultipleChoices } from '#tui/prompts/select/render';
import type { Choice, MultiSelectPromptOptions } from '#tui/types';

const choicesFromCommaSeparated = <T>(choices: Array<Choice<T>>, answer: string): T[] => {
	const parts = answer
		.split(',')
		.map((part) => part.trim())
		.filter((part) => part.length > 0);

	const selected = parts.map((part) => findChoice(choices, part)).filter((choice): choice is Choice<T> => choice !== undefined && !choice.disabled);

	if (selected.length !== parts.length) {
		throw new PromptValidationError('Please select valid options.');
	}

	return selected.map((choice) => choice.value);
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
	const selectedValues = new Set(defaults);

	if (!environment.input.readKey) {
		const rendered = renderChoices(choices);

		const answer = await ask(`${message}\n${rendered}\n`, hint);

		return answer.trim() === '' ? defaults : choicesFromCommaSeparated(choices, answer);
	}

	let selected = firstEnabledIndex(choices);

	const marked = new Set(choices.flatMap((choice, index) => (selectedValues.has(choice.value) ? [index] : [])));

	renderMultipleChoices(message, choices, selected, marked, scroll, info);

	while (true) {
		const key = await environment.input.readKey();

		if (key === null) {
			return [...marked].map((index) => choices[index]?.value).filter((value): value is T => value !== undefined);
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

		if (nextChoiceKeys(key)) {
			selected = nextEnabledIndex(choices, selected, 1);
			renderMultipleChoices(message, choices, selected, marked, scroll, info);
			continue;
		}

		if (previousChoiceKeys(key)) {
			selected = nextEnabledIndex(choices, selected, -1);
			renderMultipleChoices(message, choices, selected, marked, scroll, info);
			continue;
		}

		if (key === Key.pageDown) {
			selected = pageEnabledChoiceIndex(choices, selected, 1, scroll);
			renderMultipleChoices(message, choices, selected, marked, scroll, info);
			continue;
		}

		if (key === Key.pageUp) {
			selected = pageEnabledChoiceIndex(choices, selected, -1, scroll);
			renderMultipleChoices(message, choices, selected, marked, scroll, info);
			continue;
		}

		if (oneOf([Key.home], key)) {
			selected = firstEnabledIndex(choices);
			renderMultipleChoices(message, choices, selected, marked, scroll, info);
			continue;
		}

		if (oneOf([Key.end], key)) {
			selected = lastEnabledChoiceIndex(choices);
			renderMultipleChoices(message, choices, selected, marked, scroll, info);
			continue;
		}

		if (key === Key.ctrlA) {
			if (marked.size === choices.filter((choice) => !choice.disabled).length) {
				marked.clear();
			} else {
				marked.clear();

				for (const [index, choice] of choices.entries()) {
					if (!choice.disabled) {
						marked.add(index);
					}
				}
			}

			renderMultipleChoices(message, choices, selected, marked, scroll, info);
			continue;
		}

		if (key === Key.space) {
			if (marked.has(selected)) {
				marked.delete(selected);
			} else if (!choices[selected]?.disabled) {
				marked.add(selected);
			}

			renderMultipleChoices(message, choices, selected, marked, scroll, info);
			continue;
		}

		if (key === Key.enter) {
			return [...marked].map((index) => choices[index]?.value).filter((value): value is T => value !== undefined);
		}
	}
};
