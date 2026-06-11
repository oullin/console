import { promptUntilValid } from '#tui/prompt';
import { readDataTableSelection } from '#tui/output/data-table/read';
import { deriveDataTableHeaders } from '#tui/output/data-table/rows';
import type { DataTablePromptOptions } from '#tui/types';

export const datatable = async <T = unknown>(options: DataTablePromptOptions<T>): Promise<T | number> => {
	const headers = options.headers ?? deriveDataTableHeaders(options.rows);

	return promptUntilValid(options, async () => readDataTableSelection(options, headers));
};
