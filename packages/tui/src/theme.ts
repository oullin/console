import { visibleWidth } from '#tui/strings';
import { dim, yellow } from '#tui/theme/styles';
import type { Choice } from '#tui/types';

export const symbols = {
	question: '?',
	answer: '>',
	error: '!',
	info: 'i',
	selected: '●',
	unselected: '○',
	pointer: '›',
	success: '✓',
	warning: '!',
} as const;

export const renderQuestion = (message: string, hint?: string): string => {
	const suffix = hint ? ` ${hint}` : '';

	return `${symbols.question} ${message}${suffix} `;
};

export const renderError = (message: string): string => `${yellow(`  ⚠ ${message}`)}\n`;

export const renderChoices = <T>(choices: Array<Choice<T>>): string => {
	return choices
		.map((choice, index) => {
			const disabled = choice.disabled ? ` (${typeof choice.disabled === 'string' ? choice.disabled : 'disabled'})` : '';
			const hint = choice.hint ? ` ${choice.hint}` : '';

			return `  ${index + 1}. ${choice.label}${hint}${disabled}`;
		})
		.join('\n');
};

export const renderTable = (headers: string[], rows: string[][]): string => {
	const columnCount = Math.max(headers.length, ...rows.map((row) => row.length));

	if (!Number.isFinite(columnCount) || columnCount <= 0) {
		return '';
	}

	const widths = Array.from({ length: columnCount }, (_, index) => {
		return Math.max(visibleWidth(headers[index] ?? ''), ...rows.map((row) => visibleWidth(row[index] ?? '')));
	});

	const padVisible = (value: string, width: number): string => `${value}${' '.repeat(Math.max(0, width - visibleWidth(value)))}`;

	const renderRow = (columns: string[]): string => {
		return ` │ ${widths.map((width, index) => padVisible(columns[index] ?? '', width)).join(' │ ')} │`;
	};

	const renderBorder = (left: string, middle: string, right: string): string => {
		return ` ${left}${widths.map((width) => '─'.repeat(width + 2)).join(middle)}${right}`;
	};

	const top = renderBorder('┌', '┬', '┐');
	const divider = renderBorder('├', '┼', '┤');
	const bottom = renderBorder('└', '┴', '┘');

	if (headers.length === 0) {
		return [top, ...rows.map(renderRow), bottom].join('\n');
	}

	return [top, renderRow(headers.map(dim)), divider, ...rows.map(renderRow), bottom].join('\n');
};
