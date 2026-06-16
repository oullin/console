import { z } from 'zod';
import type { TableCell, TableOptions } from '#tui/types';

export const tableCellSchema: z.ZodType<TableCell> = z.union([z.string(), z.number(), z.boolean(), z.null(), z.undefined()]);

export const tableRowSchema = z.union([z.array(tableCellSchema), z.record(z.string(), tableCellSchema)]);

export const tableRowsSchema = z.array(tableRowSchema);

export const tableHeadersSchema = z.array(z.string());

export const tableStepNameSchema = z.string();

export const tableOptionsSchema = z
	.object({
		headers: tableHeadersSchema.optional(),
		rows: tableRowsSchema,
	})
	.passthrough() satisfies z.ZodType<TableOptions>;
