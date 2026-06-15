import { promptUntilValid, promptWithFallback } from '#tui/prompt';
import { activePromptFrame } from '#tui/prompt/active-frame';
import { readDataTableSelection } from '#tui/output/data-table/read';
import { renderSubmittedDataTableFrame } from '#tui/output/data-table/render';
import { deriveDataTableHeaders } from '#tui/output/data-table/rows';
import { parseDataTablePromptOptions } from '#tui/output/validators/data-table';
import { hasPromptDefault } from '#tui/validators/default';
import type { DataTableSelectionReadResult } from '#tui/output/data-table/types';
import type { DataTablePromptOptions, DataTableRow } from '#tui/types';

type NormalizedDataTablePromptOptions<T> = DataTablePromptOptions<T> & {
	hasDefault: boolean;
};

const transformDataTableValue = async <T>(options: Pick<DataTablePromptOptions<T>, 'transform'>, value: T | number): Promise<T | number> => {
	return options.transform ? options.transform(value) : value;
};

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
	const parsedOptions = parseDataTablePromptOptions<T>(optionsOrHeaders, rows, scroll, label, hint, required, validate, transform, filter);

	const options: NormalizedDataTablePromptOptions<T> = {
		...parsedOptions,
		hasDefault: hasPromptDefault(parsedOptions),
	};

	const validationOptions: DataTablePromptOptions<T> = {
		...options,
		default: options.hasDefault ? await transformDataTableValue(options, options.default as T | number) : undefined,
	};

	const headers = options.headers ?? deriveDataTableHeaders(options.rows);

	let submittedSelection: DataTableSelectionReadResult<T> | null = null;

	const activeFrame = activePromptFrame();

	return promptWithFallback('datatable', options, () =>
		promptUntilValid(
			validationOptions,
			async () => {
				const selected = await readDataTableSelection(options, headers);

				activeFrame.set(selected.frame);
				submittedSelection = selected.submitted && !selected.cancelled ? selected : null;

				return transformDataTableValue(options, selected.value);
			},
			() => {
				if (submittedSelection) {
					activeFrame.clear();
					renderSubmittedDataTableFrame(options.message, headers, submittedSelection.rows, submittedSelection.selected);
				}
			},
			activeFrame.clear,
		),
	);
}
