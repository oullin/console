import { promptEnvironment } from '#tui/environment';
import { renderInteractiveChoices } from '#tui/concerns/choices';
import { resolveInfo } from '#tui/concerns/info';
import type { Choice, MultiSelectPromptOptions, SelectPromptOptions } from '#tui/types';

export const renderSelectedChoice = <T>(message: string, choices: Array<Choice<T>>, selected: number, scroll: number | undefined, info: SelectPromptOptions<T>['info']): void => {
	renderInteractiveChoices(message, choices, selected, new Set(), scroll);

	const text = resolveInfo(info, choices[selected]?.value ?? null);

	if (text.length > 0) {
		promptEnvironment().output.write(`${text}\n`);
	}
};

export const renderMultipleChoices = <T>(message: string, choices: Array<Choice<T>>, selected: number, marked: Set<number>, scroll?: number, info?: MultiSelectPromptOptions<T>['info']): void => {
	renderInteractiveChoices(message, choices, selected, marked, scroll);

	const text = resolveInfo(info, choices[selected]?.value ?? null);
	const summary = scroll !== undefined && choices.length > scroll ? `${marked.size} selected` : '';
	const details = [text, summary].filter((part) => part.length > 0).join(' · ');

	if (details.length > 0) {
		promptEnvironment().output.write(`${details}\n`);
	}

	const labels = [...marked]
		.sort((left, right) => left - right)
		.map((index) => choices[index]?.label)
		.filter((label): label is string => label !== undefined);

	if (labels.length > 0) {
		promptEnvironment().output.write(`Selected: ${labels.join(', ')}\n`);
	}
};
