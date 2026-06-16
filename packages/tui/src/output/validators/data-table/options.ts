import { dataTableHeadersSchema, dataTablePromptOptionsSchema, dataTableRowsSchema, dataTableStepNameSchema } from '#tui/output/validators/data-table/schemas';
import type { DataTablePromptOptions, DataTableRow } from '#tui/types';

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
