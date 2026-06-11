import { promptEnvironment } from '#tui/environment';
import { choiceWindow } from '#tui/concerns/choices';
import { resolveInfo } from '#tui/concerns/info';
import { renderScrollbarRows } from '#tui/concerns/scrollbar';
import { searchMessage } from '#tui/prompts/search/choices';
import { cyan, dim } from '#tui/theme/styles';
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
	renderSearchRows(searchMessage(message, query), choices, highlighted, marked, scroll, showSelectedSummary);

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

const renderSearchRows = <T>(message: string, choices: Array<Choice<T>>, highlighted: number | null, marked: Set<number>, scroll: number | undefined, multiple: boolean): void => {
	const environment = promptEnvironment();
	const window = choiceWindow(choices.length, highlighted ?? 0, scroll);

	environment.output.write(`${message}\n`);

	const rows = choices.slice(window.start, window.end).map((choice, offset) => {
		const index = window.start + offset;
		const active = highlighted === index;
		const selected = marked.has(index);
		const label = choiceLabel(choice);

		return multiple ? multiSearchRow(label, active, selected) : searchRow(label, active);
	});

	for (const row of renderScrollbarRows(rows, window.start, window.end - window.start, choices.length)) {
		environment.output.write(`${row}\n`);
	}
};

const choiceLabel = <T>(choice: Choice<T>): string => {
	const disabled = choice.disabled ? ` (${typeof choice.disabled === 'string' ? choice.disabled : 'disabled'})` : '';
	const hint = choice.hint ? ` ${choice.hint}` : '';

	return `${choice.label}${hint}${disabled}`;
};

const searchRow = (label: string, active: boolean): string => {
	if (active) {
		return `${cyan('›')} ${label}  `;
	}

	return `  ${dim(label)}  `;
};

const multiSearchRow = (label: string, active: boolean, selected: boolean): string => {
	if (active && selected) {
		return `${cyan('› ◼')} ${label}  `;
	}

	if (active) {
		return `${cyan('›')} ◻ ${label}  `;
	}

	if (selected) {
		return `  ${cyan('◼')} ${dim(label)}  `;
	}

	return `  ${dim('◻')} ${dim(label)}  `;
};

const selectedSummary = (selectedCount: number, hiddenCount: number): string => {
	const hidden = hiddenCount > 0 ? ` (${hiddenCount} hidden)` : '';

	return `${selectedCount} selected${hidden}`;
};
