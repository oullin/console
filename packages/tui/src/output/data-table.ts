import { promptUntilValid } from '#tui/prompt';
import { readDataTableSelection } from '#tui/output/data-table/read';
import { renderSubmittedDataTableFrame } from '#tui/output/data-table/render';
import { deriveDataTableHeaders } from '#tui/output/data-table/rows';
import type { DataTableSelectionReadResult } from '#tui/output/data-table/types';
import type { DataTablePromptOptions, DataTableRow } from '#tui/types';

export function datatable<T = unknown>(options: DataTablePromptOptions<T>): Promise<T | number>;

export function datatable<T = unknown>(
	headers?: string[],
	rows?: Array<DataTableRow<T>> | null,
	scroll?: number,
	label?: string,
	hint?: string,
	required?: DataTablePromptOptions<T>['required'],
	validate?: DataTablePromptOptions<T>['validate'],
	transform?: DataTablePromptOptions<T>['transform'],
	filter?: DataTablePromptOptions<T>['filter'],
): Promise<T | number>;

export async function datatable<T = unknown>(
	optionsOrHeaders: DataTablePromptOptions<T> | string[] = [],
	rows: Array<DataTableRow<T>> | null = null,
	scroll = 10,
	label = '',
	hint = '',
	required: DataTablePromptOptions<T>['required'] = false,
	validate: DataTablePromptOptions<T>['validate'] = undefined,
	transform: DataTablePromptOptions<T>['transform'] = undefined,
	filter: DataTablePromptOptions<T>['filter'] = undefined,
): Promise<T | number> {
	const options = Array.isArray(optionsOrHeaders)
		? {
				filter,
				headers: optionsOrHeaders,
				hint,
				message: label,
				required,
				rows: rows ?? [],
				scroll,
				transform,
				validate,
			}
		: optionsOrHeaders;

	const headers = options.headers ?? deriveDataTableHeaders(options.rows);

	let submittedSelection: DataTableSelectionReadResult<T> | null = null;

	return promptUntilValid(
		options,
		async () => {
			const selected = await readDataTableSelection(options, headers);

			submittedSelection = selected.submitted && !selected.cancelled ? selected : null;

			return options.transform ? options.transform(selected.value) : selected.value;
		},
		() => {
			if (submittedSelection) {
				renderSubmittedDataTableFrame(options.message, headers, submittedSelection.rows, submittedSelection.selected);
			}
		},
	);
}
