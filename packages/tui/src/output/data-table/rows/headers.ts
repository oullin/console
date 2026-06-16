import { parseDataTableRowShape } from '#tui/output/validators/data-table';
import { dataTableRowFields } from '#tui/output/data-table/rows/fields';
import type { DataTableRow } from '#tui/types';

export const deriveDataTableHeaders = <T>(rows: Array<DataTableRow<T>>): string[] => {
	const first = rows[0];

	if (!first) {
		return [];
	}

	const shape = parseDataTableRowShape(first);

	if (shape.kind === 'array') {
		return shape.row.map((_, index) => String(index + 1));
	}

	return Object.keys(dataTableRowFields(first)).filter((key) => key !== 'value');
};
