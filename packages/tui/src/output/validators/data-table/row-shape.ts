import { z } from 'zod';
import { dataObjectRowSchema, dataTableArrayRowSchema, dataTableRecordRowSchema } from '#tui/output/validators/data-table/schemas';
import type { DataTableObjectRow, DataTableRow, TableCell } from '#tui/types';

const typedDataObjectRowSchema = <T>(): z.ZodType<DataTableObjectRow<T>> => dataObjectRowSchema as z.ZodType<DataTableObjectRow<T>>;
const dataTableRowValueSchema = <T>(): z.ZodType<T> => z.unknown() as z.ZodType<T>;

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

export const parseDataTableRowShape = <T>(row: DataTableRow<T>): DataTableRowShape<T> => {
	const objectRow = typedDataObjectRowSchema<T>().safeParse(row);

	if (objectRow.success) {
		return { kind: 'object', row: objectRow.data };
	}

	const arrayRow = dataTableArrayRowSchema.safeParse(row);

	if (arrayRow.success) {
		return { kind: 'array', row: arrayRow.data };
	}

	return { kind: 'record', row: dataTableRecordRowSchema.parse(row) };
};

export const parseDataTableRowValue = <T>(value: unknown): T => {
	return dataTableRowValueSchema<T>().parse(value);
};
