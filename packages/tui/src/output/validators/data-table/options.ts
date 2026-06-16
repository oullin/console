import { z } from 'zod';
import { dataTableHeadersSchema, dataTablePromptOptionsSchema, dataTableRowsSchema, dataTableStepNameSchema } from '#tui/output/validators/data-table/schemas';
import type { DataTablePromptOptions, DataTableRow } from '#tui/types';

const dataTableDefaultSchema = <T>(): z.ZodType<T | number> => z.unknown() as z.ZodType<T | number>;
const dataTablePromptOptionsTypedSchema = <T>(): z.ZodType<DataTablePromptOptions<T>> => dataTablePromptOptionsSchema as z.ZodType<DataTablePromptOptions<T>>;
const dataTableRowsTypedSchema = <T>(): z.ZodType<Array<DataTableRow<T>>> => dataTableRowsSchema as z.ZodType<Array<DataTableRow<T>>>;

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
	const promptOptions = dataTablePromptOptionsTypedSchema<T>().safeParse(optionsOrHeaders);

	if (promptOptions.success) {
		return promptOptions.data;
	}

	return {
		filter,
		headers: dataTableHeadersSchema.parse(optionsOrHeaders),
		hint,
		message: label,
		required,
		rows: dataTableRowsTypedSchema<T>().parse(rows ?? []),
		scroll,
		transform,
		validate,
	};
};

export const parseDataTableDefault = <T>(value: unknown): T | number => {
	return dataTableDefaultSchema<T>().parse(value);
};
