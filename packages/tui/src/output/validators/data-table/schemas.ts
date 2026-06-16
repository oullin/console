import { z } from 'zod';
import type { DataTableObjectRow, TableCell } from '#tui/types';

export const tableCellSchema: z.ZodType<TableCell> = z.union([z.string(), z.number(), z.boolean(), z.null(), z.undefined()]);

export const dataTableArrayRowSchema = z.array(tableCellSchema);

export const dataTableRecordRowSchema = z.record(z.string(), tableCellSchema);

export const dataTableStepNameSchema = z.string();

export const dataObjectRowSchema: z.ZodType<DataTableObjectRow<unknown>> = z
	.object({
		cells: z.record(z.string(), tableCellSchema),
		value: z.unknown().optional(),
	})
	.passthrough();

export const dataTableRowSchema = z.union([dataObjectRowSchema, dataTableArrayRowSchema, dataTableRecordRowSchema]);

export const dataTablePromptOptionsSchema = z
	.object({
		headers: z.array(z.string()).optional(),
		message: z.string(),
		rows: z.array(dataTableRowSchema),
		scroll: z.number().optional(),
	})
	.passthrough();

export const dataTableHeadersSchema = z.array(z.string());

export const dataTableRowsSchema = z.array(dataTableRowSchema);
