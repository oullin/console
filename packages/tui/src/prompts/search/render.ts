import { promptEnvironment } from '#tui/environment';
import { renderInteractiveChoices } from '#tui/concerns/choices';
import { resolveInfo } from '#tui/concerns/info';
import { searchMessage } from '#tui/prompts/search/choices';
import type { Choice, MultiSearchPromptOptions, SearchPromptOptions } from '#tui/types';

export const renderSearchChoices = <T>(
	message: string,
	query: string,
	choices: Array<Choice<T>>,
	highlighted: number | null,
	marked: Set<number> = new Set(),
	selectedLabels: string[] = [],
	scroll?: number,
	info?: SearchPromptOptions<T>['info'] | MultiSearchPromptOptions<T>['info'],
): void => {
	renderInteractiveChoices(searchMessage(message, query), choices, highlighted ?? 0, marked, scroll);

	const text = resolveInfo(info, highlighted === null ? null : (choices[highlighted]?.value ?? null));

	if (text.length > 0) {
		promptEnvironment().output.write(`${text}\n`);
	}

	if (selectedLabels.length > 0) {
		promptEnvironment().output.write(`Selected: ${selectedLabels.join(', ')}\n`);
	}
};
