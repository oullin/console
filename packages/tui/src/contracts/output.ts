import type { BasePromptOptions } from '#tui/contracts/options';

export type TableCell = string | number | boolean | null | undefined;

export type TableOptions = {
	headers?: string[];
	rows: Array<Array<TableCell> | Record<string, TableCell>>;
};

export type DataTablePromptOptions<T = unknown> = BasePromptOptions<T | number> & {
	filter?: (row: DataTableRow<T>, query: string) => boolean;
	headers?: string[];
	rows: Array<DataTableRow<T>>;
	scroll?: number;
	transform?: (value: T | number) => T | number | Promise<T | number>;
};

export type DataTableObjectRow<T = unknown> = {
	cells: Record<string, TableCell>;
	value?: T;
};

export type DataTableRow<T = unknown> = Array<TableCell> | Record<string, TableCell> | DataTableObjectRow<T>;
