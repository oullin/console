import { tableHeadersSchema, tableOptionsSchema, tableRowsSchema, tableStepNameSchema } from '#tui/output/validators/table/schemas';
import { inferredTableHeaders } from '#tui/output/validators/table/rows';
import type { TableOptions } from '#tui/types';

export { tableRowCells } from '#tui/output/validators/table/rows';

export const isTableOptions = (value: unknown): value is TableOptions => {
	return tableOptionsSchema.safeParse(value).success;
};

export const tableStepName = (value: unknown): string | undefined => {
	const result = tableStepNameSchema.safeParse(value);

	return result.success ? result.data : undefined;
};

export const parseTableOptions = (headersOrOptions: unknown = [], rows: unknown = null): Required<TableOptions> => {
	const tableOptions = tableOptionsSchema.safeParse(headersOrOptions);

	if (tableOptions.success) {
		const headers = tableOptions.data.headers ?? inferredTableHeaders(tableOptions.data.rows);

		return { headers, rows: tableOptions.data.rows };
	}

	if (rows === null) {
		const rowOnlyOptions = tableRowsSchema.safeParse(headersOrOptions);

		if (rowOnlyOptions.success) {
			return { headers: [], rows: rowOnlyOptions.data };
		}
	}

	return {
		headers: tableHeadersSchema.parse(headersOrOptions),
		rows: rows === null ? [] : tableRowsSchema.parse(rows),
	};
};
