import { z } from 'zod';
import type { DataTableObjectRow, DataTablePromptOptions, DataTableRow, TableCell } from '#tui/types';

const tableCellSchema: z.ZodType<TableCell> = z.union([z.string(), z.number(), z.boolean(), z.null(), z.undefined()]);
const dataTableArrayRowSchema = z.array(tableCellSchema);
const dataTableRecordRowSchema = z.record(z.string(), tableCellSchema);
const dataTableStepNameSchema = z.string();

const dataObjectRowSchema = z
	.object({
		cells: z.record(z.string(), tableCellSchema),
		value: z.unknown().optional(),
	})
	.passthrough();

const dataTableRowSchema = z.union([dataObjectRowSchema, dataTableArrayRowSchema, dataTableRecordRowSchema]);

const dataTablePromptOptionsSchema = z
	.object({
		headers: z.array(z.string()).optional(),
		message: z.string(),
		rows: z.array(dataTableRowSchema),
		scroll: z.number().optional(),
	})
	.passthrough();

const dataTableHeadersSchema = z.array(z.string());
const dataTableRowsSchema = z.array(dataTableRowSchema);

export type DataTableRowShape<T> =
	| {
			kind: 'array';
			row: TableCell[];
	  }
	| {
			kind: 'object';
			row: DataTableObjectRow<T>;
	  }
	| {
			kind: 'record';
			row: Record<string, TableCell>;
	  };

export const isDataObjectRow = <T>(row: DataTableRow<T>): row is DataTableObjectRow<T> => {
	return dataObjectRowSchema.safeParse(row).success;
};

export const isDataTablePromptOptions = <T>(value: unknown): value is DataTablePromptOptions<T> => {
	return dataTablePromptOptionsSchema.safeParse(value).success;
};

export const dataTableStepName = (value: unknown): string | undefined => {
	const result = dataTableStepNameSchema.safeParse(value);

	return result.success ? result.data : undefined;
};

export const parseDataTablePromptOptions = <T>(
	optionsOrHeaders: unknown = [],
	rows: unknown = null,
	scroll = 10,
	label = '',
	hint = '',
	required: DataTablePromptOptions<T>['required'] = false,
	validate: DataTablePromptOptions<T>['validate'] = undefined,
	transform: DataTablePromptOptions<T>['transform'] = undefined,
	filter: DataTablePromptOptions<T>['filter'] = undefined,
): DataTablePromptOptions<T> => {
	const promptOptions = dataTablePromptOptionsSchema.safeParse(optionsOrHeaders);

	if (promptOptions.success) {
		return promptOptions.data as DataTablePromptOptions<T>;
	}

	return {
		filter,
		headers: dataTableHeadersSchema.parse(optionsOrHeaders),
		hint,
		message: label,
		required,
		rows: rows === null ? [] : (dataTableRowsSchema.parse(rows) as Array<DataTableRow<T>>),
		scroll,
		transform,
		validate,
	};
};

export const parseDataTableRowShape = <T>(row: DataTableRow<T>): DataTableRowShape<T> => {
	const objectRow = dataObjectRowSchema.safeParse(row);

	if (objectRow.success) {
		return { kind: 'object', row: objectRow.data as DataTableObjectRow<T> };
	}

	const arrayRow = dataTableArrayRowSchema.safeParse(row);

	if (arrayRow.success) {
		return { kind: 'array', row: arrayRow.data };
	}

	return { kind: 'record', row: dataTableRecordRowSchema.parse(row) };
};
