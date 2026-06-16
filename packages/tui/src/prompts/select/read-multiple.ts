import { promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { ask, cancelPrompt } from '#tui/prompt';
import { eraseRenderedFrame } from '#tui/status/frame';
import { renderChoices } from '#tui/theme';
import { firstEnabledIndex } from '#tui/concerns/choices';
import { moveSelectHighlight, selectNavigationAction } from '#tui/prompts/select/keys';
import { choicesFromCommaSeparated, markedChoiceIndexes, markedChoiceValues, toggleAllEnabledChoices, toggleMarkedChoice } from '#tui/prompts/select/multiple';
import { parseChoiceIndex } from '#tui/prompts/select/navigation';
import { cancelledMultipleChoicesResult, multipleChoicesResult, multipleChoicesValueResult } from '#tui/prompts/select/read-multiple/result';
import { renderCancelledChoices, renderMultipleChoices } from '#tui/prompts/select/render';
import type { Choice, MultiSelectPromptOptions } from '#tui/types';

export type MultipleChoicesReadResult<T> = {
	cancelled: boolean;
	frame?: string;
	submitted: boolean;
	submittedLabels: string[];
	value: T[];
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

		return multipleChoicesValueResult(value);
	}

	let selected = firstEnabledIndex(choices);

	let marked = markedChoiceIndexes(choices, defaults);

	let frame = renderMultipleChoices(message, choices, selected, marked, scroll, info);

	while (true) {
		const key = await environment.input.readKey();

		if (key === null) {
			return multipleChoicesResult(choices, marked, true, false, frame);
		}

		if (key === Key.ctrlC) {
			eraseRenderedFrame(frame);
			renderCancelledChoices(message, choices, selected, marked, scroll);

			return cancelledMultipleChoicesResult(choices, marked, await cancelPrompt(markedChoiceValues(choices, marked)));
		}

		if (key.includes(',')) {
			return multipleChoicesValueResult(choicesFromCommaSeparated(choices, key));
		}

		const numeric = parseChoiceIndex(key);

		if (!Number.isNaN(numeric) && choices[numeric - 1] && !choices[numeric - 1]?.disabled) {
			const index = numeric - 1;

			if (marked.has(index)) {
				marked.delete(index);
			} else {
				marked.add(index);
			}

			eraseRenderedFrame(frame);
			frame = renderMultipleChoices(message, choices, selected, marked, scroll, info);
			continue;
		}

		const action = selectNavigationAction(key);

		if (action !== null) {
			selected = moveSelectHighlight(choices, selected, action, scroll);
			eraseRenderedFrame(frame);
			frame = renderMultipleChoices(message, choices, selected, marked, scroll, info);
			continue;
		}

		if (key === Key.ctrlA) {
			marked = toggleAllEnabledChoices(choices, marked);

			eraseRenderedFrame(frame);
			frame = renderMultipleChoices(message, choices, selected, marked, scroll, info);
			continue;
		}

		if (key === Key.space) {
			marked = toggleMarkedChoice(choices, marked, selected);

			eraseRenderedFrame(frame);
			frame = renderMultipleChoices(message, choices, selected, marked, scroll, info);
			continue;
		}

		if (key === Key.enter) {
			return multipleChoicesResult(choices, marked, true, false, frame);
		}
	}
};
