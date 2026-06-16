import { isNullOutputRows } from '#tui/form/builder/validators/output/common';
import { isTableOptions, tableStepName } from '#tui/output/validators/table';
import { tableRowsSchema } from '#tui/output/validators/table/schemas';
import type { TableOptions } from '#tui/types';

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

export const parseOutputTableRows = (value: unknown): TableOptions['rows'] | null => {
	if (isNullOutputRows(value)) {
		return null;
	}

	const parsed = tableRowsSchema.safeParse(value);

	if (!parsed.success) {
		throw new TypeError('Table rows must be an array.');
	}

	return parsed.data;
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
