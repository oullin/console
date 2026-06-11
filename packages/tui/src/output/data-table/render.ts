import { promptEnvironment } from '#tui/environment';
import { renderTable } from '#tui/theme';
import { dataTableRowCells } from '#tui/output/data-table/rows';
import { clampDataTableSelection, dataTableRowWindow } from '#tui/output/data-table/selection';
import type { VisibleDataTableRow } from '#tui/output/data-table/types';

type RenderDataTableFrameOptions<T> = {
	headers: string[];
	message: string;
	mode: 'browse' | 'search';
	query: string;
	rows: Array<VisibleDataTableRow<T>>;
	scroll?: number;
	selected: number;
};

export const renderDataTableFrame = <T>(options: RenderDataTableFrameOptions<T>): number => {
	const environment = promptEnvironment();
	const selected = clampDataTableSelection(options.selected, options.rows);
	const window = dataTableRowWindow(options.rows.length, selected, options.scroll);

	const renderedRows = options.rows.slice(window.start, window.end).map(({ row }, offset) => {
		const index = window.start + offset;

		return [index === selected ? '›' : ' ', ...dataTableRowCells(options.headers, row)];
	});

	const querySuffix = options.mode === 'search' || options.query.length > 0 ? ` ${options.query}` : '';

	environment.output.write(`${options.message}${querySuffix}\n`);
	environment.output.write(`${renderTable(['', ...options.headers], renderedRows)}\n`);

	return selected;
};
