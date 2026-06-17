import { renderSearchRows } from '#tui/prompts/search/body/rows';
import { dim } from '#tui/theme/styles';
import { placeholderWithCursor, valueWithCursor } from '#tui/typed-value/cursor';
import type { Choice } from '#tui/types';

export const renderSearchBody = <T>(
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
