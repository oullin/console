import { z } from 'zod';
import type { DataTableObjectRow, DataTableRow, TableCell } from '#tui/types';

const tableCellSchema: z.ZodType<TableCell> = z.union([z.string(), z.number(), z.boolean(), z.null(), z.undefined()]);

const dataObjectRowSchema = z
	.object({
		cells: z.record(z.string(), tableCellSchema),
		value: z.unknown().optional(),
	})
	.passthrough();

export const isDataObjectRow = <T>(row: DataTableRow<T>): row is DataTableObjectRow<T> => {
	return dataObjectRowSchema.safeParse(row).success;
};
