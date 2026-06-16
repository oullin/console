import { promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { ask, cancelPrompt } from '#tui/prompt';
import { eraseRenderedFrame } from '#tui/status/frame';
import { renderChoices } from '#tui/theme';
import { findChoice } from '#tui/concerns/choices';
import { moveSelectHighlight, selectNavigationAction } from '#tui/prompts/select/keys';
import { parseChoiceIndex } from '#tui/prompts/select/navigation';
import { defaultChoiceIndex, invalidSelectedChoice, selectedChoiceAt, selectedChoiceByDefault, selectedChoiceResult } from '#tui/prompts/select/read-selected/result';
import { renderCancelledChoice, renderSelectedChoice } from '#tui/prompts/select/render';
import type { Choice, SelectPromptOptions } from '#tui/types';

export type SelectedChoiceReadResult<T> = {
	cancelled: boolean;
	frame?: string;
	submitted: boolean;
	submittedLabel: string;
	value: T;
};

export const readSelectedChoice = async <T>(
	message: string,
	choices: Array<Choice<T>>,
	defaultValue?: T,
	hasDefault = false,
	hint?: string,
	scroll?: number,
	info?: SelectPromptOptions<T>['info'],
): Promise<SelectedChoiceReadResult<T>> => {
	const environment = promptEnvironment();

	if (!environment.input.readKey) {
		const rendered = renderChoices(choices);

		const answer = await ask(`${message}\n${rendered}\n`, hint);

		if (answer.trim() === '' && hasDefault) {
			const choice = selectedChoiceByDefault(choices, defaultValue, hasDefault);

			if (choice) {
				return selectedChoiceResult(choice, false);
			}
		}

		const choice = findChoice(choices, answer);

		if (!choice || choice.disabled) {
			throw invalidSelectedChoice();
		}

		return selectedChoiceResult(choice, false);
	}

	let selected = defaultChoiceIndex(choices, defaultValue, hasDefault);

	let frame = renderSelectedChoice(message, choices, selected, scroll, info);

	while (true) {
		const key = await environment.input.readKey();

		if (key === null) {
			const choice = selectedChoiceByDefault(choices, defaultValue, hasDefault);

			if (choice) {
				return selectedChoiceResult(choice, false);
			}

			throw invalidSelectedChoice();
		}

		if (key === Key.ctrlC) {
			eraseRenderedFrame(frame);
			renderCancelledChoice(message, choices, selected, scroll);

			const choice = selectedChoiceAt(choices, selected);

			return selectedChoiceResult({ ...choice, value: await cancelPrompt(choice.value) }, false, true);
		}

		const numeric = parseChoiceIndex(key);

		if (!Number.isNaN(numeric) && choices[numeric - 1] && !choices[numeric - 1]?.disabled) {
			const choice = selectedChoiceAt(choices, numeric - 1);

			return selectedChoiceResult(choice, true, false, frame);
		}

		const action = selectNavigationAction(key, { lineControls: true });

		if (action !== null) {
			selected = moveSelectHighlight(choices, selected, action, scroll);
			eraseRenderedFrame(frame);
			frame = renderSelectedChoice(message, choices, selected, scroll, info);
			continue;
		}

		if (key === Key.enter) {
			const choice = selectedChoiceAt(choices, selected);

			return selectedChoiceResult(choice, true, false, frame);
		}
	}
};
