import { terminalSize } from '#tui/terminal';
import { truncateDataTableColumns } from '#tui/output/data-table/widths/truncate';
import { dataTableColumnWidths } from '#tui/output/data-table/widths/columns';

type FitDataTableColumnsOptions = {
	allRows: string[][];
	headers: string[];
	maxWidth?: number;
	rows: string[][];
};

export const fitDataTableColumns = ({ allRows, headers, maxWidth = terminalSize().columns, rows }: FitDataTableColumnsOptions): { headers: string[]; rows: string[][] } => {
	const widths = dataTableColumnWidths(headers, allRows, maxWidth);

	return truncateDataTableColumns({ headers, rows, widths });
};
