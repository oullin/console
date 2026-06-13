import { promptEnvironment } from '#tui/environment';
import { renderTable } from '#tui/theme';
import { expandMultilineDataTableRows } from '#tui/output/data-table/multiline';
import { dataTableRowCells } from '#tui/output/data-table/rows';
import { renderScrollableDataTable } from '#tui/output/data-table/scrollbar';
import { clampDataTableSelection, dataTableRowWindow } from '#tui/output/data-table/selection';
import { fixedVisualDataTableRows } from '#tui/output/data-table/visual-window';
import { fitDataTableColumns } from '#tui/output/data-table/widths';
import { dim, red, strikethrough } from '#tui/theme/styles';
import { valueWithCursor } from '#tui/typed-value/cursor';
import type { DataTableRow } from '#tui/types';
import type { VisibleDataTableRow } from '#tui/output/data-table/types';

type RenderDataTableFrameOptions<T> = {
	allRows: Array<DataTableRow<T>>;
	cursor: number;
	headers: string[];
	message: string;
	mode: 'browse' | 'search';
	query: string;
	rows: Array<VisibleDataTableRow<T>>;
	scroll?: number;
	selected: number;
};

export type RenderedDataTableFrame = {
	frame: string;
	selected: number;
};

const renderHeaders = (headers: string[]): string[] => (headers.length > 0 ? ['', ...headers] : []);

export const renderDataTableFrame = <T>(options: RenderDataTableFrameOptions<T>): RenderedDataTableFrame => {
	const environment = promptEnvironment();
	const selected = clampDataTableSelection(options.selected, options.rows);
	const window = dataTableRowWindow(options.rows.length, selected, options.scroll);
	const querySuffix = options.mode === 'search' || options.query.length > 0 ? ` / ${valueWithCursor(options.query, options.cursor)}` : '';
	const lines = [`${options.message}${querySuffix}`];

	if (options.rows.length === 0) {
		lines.push(renderTable([], [['No results found.']]));

		const frame = `${lines.join('\n')}\n`;

		environment.output.write(frame);

		return { frame, selected };
	}

	const visibleCells = options.rows.slice(window.start, window.end).map(({ row }) => dataTableRowCells(options.headers, row));
	const allCells = options.allRows.map((row) => dataTableRowCells(options.headers, row));
	const fitted = fitDataTableColumns({ allRows: allCells, headers: options.headers, rows: visibleCells });

	const renderedRows = fitted.rows.map((row, offset) => {
		const index = window.start + offset;

		return [index === selected ? '›' : ' ', ...row];
	});

	const visualRows = fixedVisualDataTableRows(expandMultilineDataTableRows(renderedRows), options.scroll);

	lines.push(renderScrollableDataTable(renderHeaders(fitted.headers), visualRows, window.start, window.end - window.start, options.rows.length));

	if (window.end - window.start < options.rows.length) {
		const suffix = options.query.length > 0 ? ' results' : '';

		lines.push(`  Viewing ${window.start + 1}-${window.end} of ${options.rows.length}${suffix}`);
	}

	const frame = `${lines.join('\n')}\n`;

	environment.output.write(frame);

	return { frame, selected };
};

export const renderSubmittedDataTableFrame = <T>(message: string, headers: string[], rows: Array<VisibleDataTableRow<T>>, selected: number): void => {
	const row = rows[selected];

	if (!row) {
		return;
	}

	const display = dataTableRowCells(headers, row.row).join(', ');

	promptEnvironment().output.write(`${message}\n${display}\n`);
};

export const renderCancelledDataTableFrame = <T>(message: string, headers: string[], rows: Array<VisibleDataTableRow<T>>, selected: number): void => {
	const outputRows = rows.flatMap(({ row }, index) => {
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

	const environment = promptEnvironment();

	environment.output.write(`${message}\n`);
	environment.output.write(`${dim('/ Search')}\n`);
	environment.output.write(`${renderTable(renderHeaders(headers), outputRows)}\n`);
	environment.error.write(`${red('  ⚠ Cancelled.')}\n`);
};
