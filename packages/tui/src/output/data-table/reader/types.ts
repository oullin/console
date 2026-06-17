import type { DataTablePromptOptions } from '#tui/types';

export type DataTableReadOptions<T> = DataTablePromptOptions<T> & {
	hasDefault?: boolean;
};
