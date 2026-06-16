import { renderTable } from '#tui/theme';
import { expandMultilineDataTableRows } from '#tui/output/data-table/multiline';
import { dataTableRowCells } from '#tui/output/data-table/rows';
import { renderScrollableDataTable } from '#tui/output/data-table/scrollbar';
import { dataTableRowWindow } from '#tui/output/data-table/selection';
import { fixedVisualDataTableRows } from '#tui/output/data-table/visual-window';
import { fitDataTableColumns } from '#tui/output/data-table/widths';
import { dim, strikethrough } from '#tui/theme/styles';
import type { DataTableRow } from '#tui/types';
import type { VisibleDataTableRow } from '#tui/output/data-table/types';

export type DataTableBodyOptions<T> = {
	allRows: Array<DataTableRow<T>>;
	headers: string[];
	query: string;
	rows: Array<VisibleDataTableRow<T>>;
	scroll?: number;
	selected: number;
};

export const renderDataTableBody = <T>(options: DataTableBodyOptions<T>): string[] => {
	if (options.rows.length === 0) {
		return [renderTable([], [['No results found.']])];
	}

	const window = dataTableRowWindow(options.rows.length, options.selected, options.scroll);
	const visibleCells = options.rows.slice(window.start, window.end).map(({ row }) => dataTableRowCells(options.headers, row));
	const allCells = options.allRows.map((row) => dataTableRowCells(options.headers, row));
	const fitted = fitDataTableColumns({ allRows: allCells, headers: options.headers, rows: visibleCells });
	const visualRows = fixedVisualDataTableRows(expandMultilineDataTableRows(renderSelectedDataTableRows(fitted.rows, window.start, options.selected)), options.scroll);
	const lines = [renderScrollableDataTable(renderDataTableHeaders(fitted.headers), visualRows, window.start, window.end - window.start, options.rows.length)];

	if (window.end - window.start < options.rows.length) {
		const suffix = options.query.length > 0 ? ' results' : '';

		lines.push(`  Viewing ${window.start + 1}-${window.end} of ${options.rows.length}${suffix}`);
	}

	return lines;
};

export const renderCancelledDataTableRows = <T>(headers: string[], rows: Array<VisibleDataTableRow<T>>, selected: number): string[][] => {
	return rows.flatMap(({ row }, index) => {
		const expandedRows = expandMultilineDataTableRows([[index === selected ? '›' : ' ', ...dataTableRowCells(headers, row)]]);

		return expandedRows.map((expandedRow) => {
			return expandedRow.map((cell, columnIndex) => {
				if (columnIndex === 0) {
					return cell;
				}

				return cell.length > 0 ? dim(strikethrough(cell)) : '';
			});
		});
	});
};

export const renderSubmittedDataTableRow = <T>(headers: string[], rows: Array<VisibleDataTableRow<T>>, selected: number): string | null => {
	const row = rows[selected];

	return row ? dataTableRowCells(headers, row.row).join(', ') : null;
};

export const renderDataTableHeaders = (headers: string[]): string[] => (headers.length > 0 ? ['', ...headers] : []);

const renderSelectedDataTableRows = (rows: string[][], start: number, selected: number): string[][] => {
	return rows.map((row, offset) => {
		const index = start + offset;

		return [index === selected ? '›' : ' ', ...row];
	});
};
