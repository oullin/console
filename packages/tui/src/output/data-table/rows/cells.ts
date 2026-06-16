import type { TableCell } from '#tui/types';

export const stringifyDataTableCell = (value: TableCell): string => {
	return value === null || value === undefined ? '' : String(value);
};
