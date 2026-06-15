import { promptEnvironment } from '#tui/environment';
import { choiceWindow } from '#tui/concerns/choices';
import { resolveInfo } from '#tui/concerns/info';
import { renderScrollbarRows } from '#tui/concerns/scrollbar';
import { renderBox } from '#tui/theme/box';
import { cyan, dim, red, strikethrough } from '#tui/theme/styles';
import { valueWithCursor } from '#tui/typed-value/cursor';
import type { SuggestOptions } from '#tui/prompts/suggest/options';

export const renderSuggestions = (
	message: string,
	value: string,
	cursor: number,
	matches: string[],
	highlighted: number | null,
	scroll?: number,
	info?: SuggestOptions['info'],
	placeholder = '',
): string => {
	const text = resolveInfo(info, highlighted === null ? null : (matches[highlighted] ?? null));
	const frame = `${renderBox({ body: renderSuggestBody(value, cursor, placeholder, matches, highlighted, scroll), borderStyle: cyan, info: text, title: cyan(message) })}\n`;

	promptEnvironment().output.write(frame);

	return frame;
};

export const renderSubmittedSuggestion = (message: string, value: string): void => {
	promptEnvironment().output.write(`${renderBox({ body: value, title: dim(message) })}\n`);
};

export const renderCancelledSuggestion = (message: string, value: string, placeholder = ''): void => {
	const displayValue = value.length > 0 ? value : placeholder;

	promptEnvironment().output.write(`${renderBox({ body: strikethrough(dim(displayValue)), borderStyle: red, title: message })}\n`);
	promptEnvironment().error.write(`${red('  ⚠ Cancelled.')}\n`);
};

const renderSuggestBody = (value: string, cursor: number, placeholder: string, matches: string[], highlighted: number | null, scroll?: number): string => {
	const query = value.length > 0 ? valueWithCursor(value, cursor) : dim(placeholder);
	const rows = renderSuggestRows(matches, highlighted, scroll);

	if (matches.length === 0) {
		return [query, dim('  No results.')].join('\n');
	}

	return rows.length > 0 ? [query, rows].join('\n') : query;
};

const renderSuggestRows = (matches: string[], highlighted: number | null, scroll?: number): string => {
	const window = choiceWindow(matches.length, highlighted ?? 0, scroll);

	const rows = matches.slice(window.start, window.end).map((match, offset) => {
		const index = window.start + offset;

		if (index === highlighted) {
			return `${cyan('›')} ${match}  `;
		}

		return `  ${dim(match)}  `;
	});

	return renderScrollbarRows(rows, window.start, window.end - window.start, matches.length).join('\n');
};
