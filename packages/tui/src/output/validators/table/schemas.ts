import { z } from 'zod';
import { tableCellArraySchema, tableCellRecordSchema } from '#tui/output/validators/cells';
import type { TableOptions } from '#tui/types';

export const tableRowSchema = z.union([tableCellArraySchema, tableCellRecordSchema]);

export const tableRowsSchema = z.array(tableRowSchema);

export const tableHeadersSchema = z.array(z.string());

export const tableStepNameSchema = z.string();

export const tableOptionsSchema = z
	.object({
		headers: tableHeadersSchema.optional(),
		rows: tableRowsSchema,
	})
	.passthrough() satisfies z.ZodType<TableOptions>;
