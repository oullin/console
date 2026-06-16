import { z } from 'zod';
import { dataTableRowsSchema } from '#tui/output/validators/data-table/schemas';
import { tableRowsSchema } from '#tui/output/validators/table/schemas';
import type { DataTableRow, TableOptions } from '#tui/types';

const outputStepNameSchema = z.string();
const outputScrollSchema = z.number();
const nullOutputRowsSchema = z.null();

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

	return dataTableRowsSchema.parse(value) as Array<DataTableRow<T>>;
};
