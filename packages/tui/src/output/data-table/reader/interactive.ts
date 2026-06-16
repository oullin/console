import { Key } from '#tui/key';
import { dataTableNavigationAction, startsDataTableSearch } from '#tui/output/data-table/keys';
import { cancelDataTableSelection } from '#tui/output/data-table/reader/cancel';
import { assertSelectedDataTableRow, dataTableSelectionResult } from '#tui/output/data-table/reader/result';
import { createDataTableReaderSession } from '#tui/output/data-table/reader/session';
import type { DataTableReadOptions } from '#tui/output/data-table/reader/types';
import type { DataTableSelectionReadResult } from '#tui/output/data-table/types';
import type { PromptInput } from '#tui/types';

export const readDataTableSelectionInteractive = async <T>(
	readKey: NonNullable<PromptInput['readKey']>,
	options: DataTableReadOptions<T>,
	headers: string[],
): Promise<DataTableSelectionReadResult<T>> => {
	const session = createDataTableReaderSession(options, headers);

	session.render();

	while (true) {
		const key = await readKey();

		if (key === null) {
			const currentRows = session.rows();

			assertSelectedDataTableRow(currentRows, session.selected(), session.frame());

			return dataTableSelectionResult(currentRows, session.selected(), false, false, session.frame());
		}

		const rows = session.rows();

		if (key === Key.ctrlC) {
			return cancelDataTableSelection(options.message, headers, rows, session.selected(), session.frame());
		}

		if (session.applySearchKey(key)) {
			continue;
		}

		if (startsDataTableSearch(key)) {
			session.beginSearch();
			continue;
		}

		const action = dataTableNavigationAction(key);

		if (action !== null) {
			session.moveSelection(action);
			continue;
		}

		if (key === Key.enter) {
			assertSelectedDataTableRow(rows, session.selected(), session.frame());

			return dataTableSelectionResult(rows, session.selected(), true, false, session.frame());
		}
	}
};
