import { visibleWidth } from '#tui/strings';
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

export const renderError = (message: string): string => `${symbols.error} ${message}\n`;

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
	const widths = headers.map((header, index) => {
		return Math.max(visibleWidth(header), ...rows.map((row) => visibleWidth(row[index] ?? '')));
	});

	const padVisible = (value: string, width: number): string => `${value}${' '.repeat(Math.max(0, width - visibleWidth(value)))}`;

	const renderRow = (columns: string[]): string => {
		return `| ${widths.map((width, index) => padVisible(columns[index] ?? '', width)).join(' | ')} |`;
	};

	const divider = `| ${widths.map((width) => '-'.repeat(width)).join(' | ')} |`;

	return [renderRow(headers), divider, ...rows.map(renderRow)].join('\n');
};
