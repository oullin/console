import { promptEnvironment } from '#tui/environment';
import { renderTable } from '#tui/theme';
import { expandMultilineDataTableRows } from '#tui/output/data-table/multiline';
import { dataTableRowCells } from '#tui/output/data-table/rows';
import { renderScrollableDataTable } from '#tui/output/data-table/scrollbar';
import { clampDataTableSelection, dataTableRowWindow } from '#tui/output/data-table/selection';
import { dim, red, strikethrough } from '#tui/theme/styles';
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

const renderHeaders = (headers: string[]): string[] => (headers.length > 0 ? ['', ...headers] : []);

export const renderDataTableFrame = <T>(options: RenderDataTableFrameOptions<T>): number => {
	const environment = promptEnvironment();
	const selected = clampDataTableSelection(options.selected, options.rows);
	const window = dataTableRowWindow(options.rows.length, selected, options.scroll);
	const querySuffix = options.mode === 'search' || options.query.length > 0 ? ` ${options.query}` : '';

	environment.output.write(`${options.message}${querySuffix}\n`);

	if (options.rows.length === 0) {
		environment.output.write(`${renderTable([], [['No results found.']])}\n`);

		return selected;
	}

	const renderedRows = options.rows.slice(window.start, window.end).map(({ row }, offset) => {
		const index = window.start + offset;

		return [index === selected ? '›' : ' ', ...dataTableRowCells(options.headers, row)];
	});

	environment.output.write(
		`${renderScrollableDataTable(renderHeaders(options.headers), expandMultilineDataTableRows(renderedRows), window.start, window.end - window.start, options.rows.length)}\n`,
	);

	if (window.end - window.start < options.rows.length) {
		const suffix = options.query.length > 0 ? ' results' : '';

		environment.output.write(`  Viewing ${window.start + 1}-${window.end} of ${options.rows.length}${suffix}\n`);
	}

	return selected;
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
	environment.error.write(`${red('Cancelled.')}\n`);
};
