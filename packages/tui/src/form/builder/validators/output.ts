import { z } from 'zod';
import { dataTableStepName, isDataTablePromptOptions } from '#tui/output/validators/data-table';
import { dataTableRowsSchema } from '#tui/output/validators/data-table/schemas';
import { isTableOptions, tableStepName } from '#tui/output/validators/table';
import { tableRowsSchema } from '#tui/output/validators/table/schemas';
import type { DataTablePromptOptions, DataTableRow, TableOptions } from '#tui/types';

const outputStepNameSchema = z.string();
const outputScrollSchema = z.number();
const nullOutputRowsSchema = z.null();
const outputDataTableRowsSchema = <T>(): z.ZodType<Array<DataTableRow<T>>> => dataTableRowsSchema as z.ZodType<Array<DataTableRow<T>>>;

export type ResolvedTableFormArguments =
	| {
			kind: 'options';
			name?: string;
			options: TableOptions;
	  }
	| {
			headers: string[];
			kind: 'rows';
			name?: string;
			rows: TableOptions['rows'] | null;
	  };

export type ResolvedDataTableFormArguments<T> = {
	name?: string;
	options: DataTablePromptOptions<T>;
};

export const parseOutputStepName = (value: unknown): string | undefined => {
	const parsed = outputStepNameSchema.safeParse(value);

	return parsed.success ? parsed.data : undefined;
};

export const parseOutputScroll = (value: unknown, defaultValue: number): number => {
	const parsed = outputScrollSchema.safeParse(value);

	return parsed.success ? parsed.data : defaultValue;
};

export const parseOutputTableRows = (value: unknown): TableOptions['rows'] | null => {
	if (nullOutputRowsSchema.safeParse(value).success) {
		return null;
	}

	return tableRowsSchema.parse(value);
};

export const parseOutputDataTableRows = <T>(value: unknown): Array<DataTableRow<T>> | null => {
	if (nullOutputRowsSchema.safeParse(value).success) {
		return null;
	}

	return outputDataTableRowsSchema<T>().parse(value);
};

export const resolveTableFormArguments = (
	headersOrOptions: TableOptions | string[] = [],
	rowsOrName: TableOptions['rows'] | string | null = null,
	name?: string,
): ResolvedTableFormArguments => {
	if (isTableOptions(headersOrOptions)) {
		return {
			kind: 'options',
			name: tableStepName(rowsOrName),
			options: headersOrOptions,
		};
	}

	return {
		headers: headersOrOptions,
		kind: 'rows',
		name,
		rows: parseOutputTableRows(rowsOrName),
	};
};

export const resolveDataTableFormArguments = <T>(
	optionsOrHeaders: DataTablePromptOptions<T> | string[] = [],
	rowsOrName: Array<DataTableRow<T>> | null | string = null,
	scrollOrName: number | string = 10,
	label = '',
	hint = '',
	required: DataTablePromptOptions<T>['required'] = false,
	validate: DataTablePromptOptions<T>['validate'] = undefined,
	transform: DataTablePromptOptions<T>['transform'] = undefined,
	filter: DataTablePromptOptions<T>['filter'] = undefined,
	name?: string,
): ResolvedDataTableFormArguments<T> => {
	if (isDataTablePromptOptions<T>(optionsOrHeaders)) {
		return {
			name: dataTableStepName(rowsOrName),
			options: optionsOrHeaders,
		};
	}

	return {
		name: parseOutputStepName(scrollOrName) ?? name,
		options: {
			filter,
			headers: optionsOrHeaders,
			hint,
			message: label,
			required,
			rows: parseOutputDataTableRows<T>(rowsOrName) ?? [],
			scroll: parseOutputScroll(scrollOrName, 10),
			transform,
			validate,
		},
	};
};
