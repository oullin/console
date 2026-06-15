import { promptEnvironment } from '#tui/environment';
import { choiceWindow } from '#tui/concerns/choices';
import { resolveInfo } from '#tui/concerns/info';
import { renderScrollbarRows } from '#tui/concerns/scrollbar';
import { renderBox } from '#tui/theme/box';
import { cyan, dim, red, strikethrough } from '#tui/theme/styles';
import { placeholderWithCursor, valueWithCursor } from '#tui/typed-value/cursor';
import type { Choice, MultiSearchPromptOptions, SearchPromptOptions } from '#tui/types';

export const renderSearchChoices = <T>(
	message: string,
	query: string,
	cursor: number,
	choices: Array<Choice<T>>,
	highlighted: number | null,
	marked: Set<number> = new Set(),
	selectedLabels: string[] = [],
	scroll?: number,
	info?: SearchPromptOptions<T>['info'] | MultiSearchPromptOptions<T>['info'],
	showSelectedSummary = false,
	placeholder = '',
): string => {
	const text = resolveInfo(info, highlighted === null ? null : (choices[highlighted]?.value ?? null));
	const summary = showSelectedSummary ? selectedSummary(selectedLabels.length, selectedLabels.length - marked.size) : '';
	const details = [text, summary].filter((part) => part.length > 0).join(' · ');
	const frame = `${renderBox({ body: renderSearchBody(query, cursor, placeholder, choices, highlighted, marked, scroll, showSelectedSummary), borderStyle: cyan, info: details, title: cyan(message) })}\n`;

	promptEnvironment().output.write(frame);

	return frame;
};

export const renderSubmittedSearchChoice = (message: string, label: string): void => {
	promptEnvironment().output.write(`${renderBox({ body: label, title: dim(message) })}\n`);
};

export const renderSubmittedSearchChoices = (message: string, labels: string[]): void => {
	promptEnvironment().output.write(`${renderBox({ body: labels.join('\n'), title: dim(message) })}\n`);
};

export const renderCancelledSearch = (message: string, query: string, placeholder = ''): void => {
	const body = strikethrough(dim(query.length > 0 ? query : placeholder));

	promptEnvironment().output.write(`${renderBox({ body, borderStyle: red, title: dim(message) })}\n`);
	promptEnvironment().error.write(`${red('  ⚠ Cancelled.')}\n`);
};

const renderSearchBody = <T>(
	query: string,
	cursor: number,
	placeholder: string,
	choices: Array<Choice<T>>,
	highlighted: number | null,
	marked: Set<number>,
	scroll: number | undefined,
	multiple: boolean,
): string => {
	const value = query.length > 0 ? valueWithCursor(query, cursor) : placeholderWithCursor(placeholder);
	const rows = renderSearchRows(choices, highlighted, marked, scroll, multiple);

	if (query.length > 0 && choices.length === 0) {
		return [value, dim('  No results.')].join('\n');
	}

	return rows.length > 0 ? [value, rows].join('\n') : value;
};

const renderSearchRows = <T>(choices: Array<Choice<T>>, highlighted: number | null, marked: Set<number>, scroll: number | undefined, multiple: boolean): string => {
	const window = choiceWindow(choices.length, highlighted ?? 0, scroll);

	const rows = choices.slice(window.start, window.end).map((choice, offset) => {
		const index = window.start + offset;
		const active = highlighted === index;
		const selected = marked.has(index);
		const label = choiceLabel(choice);

		return multiple ? multiSearchRow(label, active, selected) : searchRow(label, active);
	});

	return renderScrollbarRows(rows, window.start, window.end - window.start, choices.length).join('\n');
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
