import { dataObjectRowSchema, dataTableArrayRowSchema, dataTableRecordRowSchema } from '#tui/output/validators/data-table/schemas';
import type { DataTableObjectRow, DataTableRow, TableCell } from '#tui/types';

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
