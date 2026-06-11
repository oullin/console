import { z } from 'zod';
import type { TableCell, TableOptions } from '#tui/types';

const tableCellSchema: z.ZodType<TableCell> = z.union([z.string(), z.number(), z.boolean(), z.null(), z.undefined()]);
const tableRowSchema = z.union([z.array(tableCellSchema), z.record(z.string(), tableCellSchema)]);
const tableRowsSchema = z.array(tableRowSchema);
const tableHeadersSchema = z.array(z.string());

const tableOptionsSchema = z
	.object({
		headers: tableHeadersSchema.optional(),
		rows: tableRowsSchema,
	})
	.passthrough();

export const parseTableOptions = (headersOrOptions: unknown = [], rows: unknown = null): Required<TableOptions> => {
	const tableOptions = tableOptionsSchema.safeParse(headersOrOptions);

	if (tableOptions.success) {
		const headers = tableOptions.data.headers ?? Object.keys(tableOptions.data.rows[0] ?? {});

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
