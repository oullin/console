import { visibleWidth } from '#tui/strings';
import { dim } from '#tui/theme/styles';

const padVisible = (value: string, width: number): string => `${value}${' '.repeat(Math.max(0, width - visibleWidth(value)))}`;

const tableColumnCount = (headers: string[], rows: string[][]): number => {
	return Math.max(headers.length, ...rows.map((row) => row.length));
};

export const renderTable = (headers: string[], rows: string[][]): string => {
	const columnCount = tableColumnCount(headers, rows);

	if (!Number.isFinite(columnCount) || columnCount <= 0) {
		return '';
	}

	const widths = Array.from({ length: columnCount }, (_, index) => {
		return Math.max(visibleWidth(headers[index] ?? ''), ...rows.map((row) => visibleWidth(row[index] ?? '')));
	});

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
