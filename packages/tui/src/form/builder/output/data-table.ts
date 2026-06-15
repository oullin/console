import { datatable } from '#tui/output';
import { previousValue } from '#tui/form/builder/previous';
import { parseOutputScroll, parseOutputStepName } from '#tui/form/builder/validators/output';
import { dataTableStepName, isDataTablePromptOptions } from '#tui/output/validators/data-table';
import type { FormBuilder } from '#tui/form/builder/index';
import type { DataTablePromptOptions, DataTableRow } from '#tui/types';

export function datatableFormStep<T = unknown>(this: FormBuilder, options: DataTablePromptOptions<T>, name?: string): FormBuilder;

export function datatableFormStep<T = unknown>(
	this: FormBuilder,
	headers?: string[],
	rows?: Array<DataTableRow<T>> | null,
	scroll?: number,
	label?: string,
	hint?: string,
	required?: DataTablePromptOptions<T>['required'],
	validate?: DataTablePromptOptions<T>['validate'],
	transform?: DataTablePromptOptions<T>['transform'],
	filter?: DataTablePromptOptions<T>['filter'],
	name?: string,
): FormBuilder;

export function datatableFormStep<T = unknown>(
	this: FormBuilder,
	optionsOrHeaders: DataTablePromptOptions<T> | string[] = [],
	rowsOrName: Array<DataTableRow<T>> | null | string = null,
	scrollOrName: number | string = 10,
	label = '',
	hint = '',
	required: DataTablePromptOptions<T>['required'] = false,
	validate: DataTablePromptOptions<T>['validate'] = undefined,
	transform: DataTablePromptOptions<T>['transform'] = undefined,
	filter: DataTablePromptOptions<T>['filter'] = undefined,
	name?: string,
): FormBuilder {
	if (isDataTablePromptOptions<T>(optionsOrHeaders)) {
		return this.add((_, previous) => datatable<T>({ ...optionsOrHeaders, default: previousValue(previous, optionsOrHeaders.default) }), dataTableStepName(rowsOrName));
	}

	const stepName = parseOutputStepName(scrollOrName) ?? name;
	const scroll = parseOutputScroll(scrollOrName, 10);

	return this.add(
		(_, previous) =>
			datatable<T>({
				default: previousValue<T | number | undefined>(previous, undefined),
				filter,
				headers: optionsOrHeaders,
				hint,
				message: label,
				required,
				rows: (rowsOrName as Array<DataTableRow<T>> | null) ?? [],
				scroll,
				transform,
				validate,
			}),
		stepName,
	);
}
