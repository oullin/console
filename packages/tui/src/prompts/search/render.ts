import { promptEnvironment } from '#tui/environment';
import { renderInteractiveChoices } from '#tui/concerns/choices';
import { resolveInfo } from '#tui/concerns/info';
import { searchMessage } from '#tui/prompts/search/choices';
import { dim } from '#tui/theme/styles';
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
	showSelectedSummary = false,
): void => {
	renderInteractiveChoices(searchMessage(message, query), choices, highlighted ?? 0, marked, scroll);

	if (query.length > 0 && choices.length === 0) {
		promptEnvironment().output.write(`${dim('  No results.')}\n`);
	}

	const text = resolveInfo(info, highlighted === null ? null : (choices[highlighted]?.value ?? null));
	const summary = showSelectedSummary ? selectedSummary(selectedLabels.length, selectedLabels.length - marked.size) : '';
	const details = [text, summary].filter((part) => part.length > 0).join(' · ');

	if (details.length > 0) {
		promptEnvironment().output.write(`${details}\n`);
	}

	if (selectedLabels.length > 0) {
		promptEnvironment().output.write(`Selected: ${selectedLabels.join(', ')}\n`);
	}
};

const selectedSummary = (selectedCount: number, hiddenCount: number): string => {
	const hidden = hiddenCount > 0 ? ` (${hiddenCount} hidden)` : '';

	return `${selectedCount} selected${hidden}`;
};
