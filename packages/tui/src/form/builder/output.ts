import { alert, clear, dataTable, datatable, error, grid, info, intro, note, notify, outro, table, title, warning } from '#tui/output';
import { previousValue } from '#tui/form/builder/previous';
import { dataTableStepName, isDataTablePromptOptions } from '#tui/output/validators/data-table';
import { isTableOptions, tableStepName } from '#tui/output/validators/table';
import type { FormBuilder } from '#tui/form/builder/index';
import type { DataTablePromptOptions, DataTableRow, TableOptions } from '#tui/types';

export type OutputBuilderMethods = {
	alert(this: FormBuilder, message: string, name?: string): FormBuilder;
	clear(this: FormBuilder, name?: string): FormBuilder;
	dataTable(this: FormBuilder, options: TableOptions, name?: string): FormBuilder;
	dataTable(this: FormBuilder, headersOrOptions?: TableOptions | string[], rows?: TableOptions['rows'] | null, name?: string): FormBuilder;
	datatable<T = unknown>(this: FormBuilder, options: DataTablePromptOptions<T>, name?: string): FormBuilder;
	datatable<T = unknown>(
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
	error(this: FormBuilder, message: string, name?: string): FormBuilder;
	grid(this: FormBuilder, items?: Array<string | number | boolean>, maxWidth?: number, name?: string): FormBuilder;
	info(this: FormBuilder, message: string, name?: string): FormBuilder;
	intro(this: FormBuilder, message: string, name?: string): FormBuilder;
	note(this: FormBuilder, message: string, type?: string | null, name?: string): FormBuilder;
	notify(this: FormBuilder, title: string, body?: string, subtitle?: string, sound?: string, icon?: string, name?: string): FormBuilder;
	outro(this: FormBuilder, message: string, name?: string): FormBuilder;
	table(this: FormBuilder, options: TableOptions, name?: string): FormBuilder;
	table(this: FormBuilder, headersOrOptions?: TableOptions | string[], rows?: TableOptions['rows'] | null, name?: string): FormBuilder;
	title(this: FormBuilder, value: string, name?: string): FormBuilder;
	warning(this: FormBuilder, message: string, name?: string): FormBuilder;
};

function dataTableFormStep(this: FormBuilder, options: TableOptions, name?: string): FormBuilder;
function dataTableFormStep(this: FormBuilder, headersOrOptions?: TableOptions | string[], rows?: TableOptions['rows'] | null, name?: string): FormBuilder;

function dataTableFormStep(this: FormBuilder, headersOrOptions: TableOptions | string[] = [], rowsOrName: TableOptions['rows'] | string | null = null, name?: string): FormBuilder {
	if (isTableOptions(headersOrOptions)) {
		return this.addSideEffect(() => dataTable(headersOrOptions), tableStepName(rowsOrName));
	}

	return this.addSideEffect(() => dataTable(headersOrOptions, rowsOrName as TableOptions['rows'] | null), name);
}

function tableFormStep(this: FormBuilder, options: TableOptions, name?: string): FormBuilder;
function tableFormStep(this: FormBuilder, headersOrOptions?: TableOptions | string[], rows?: TableOptions['rows'] | null, name?: string): FormBuilder;

function tableFormStep(this: FormBuilder, headersOrOptions: TableOptions | string[] = [], rowsOrName: TableOptions['rows'] | string | null = null, name?: string): FormBuilder {
	if (isTableOptions(headersOrOptions)) {
		return this.addSideEffect(() => table(headersOrOptions), tableStepName(rowsOrName));
	}

	return this.addSideEffect(() => table(headersOrOptions, rowsOrName as TableOptions['rows'] | null), name);
}

function datatableFormStep<T = unknown>(this: FormBuilder, options: DataTablePromptOptions<T>, name?: string): FormBuilder;
function datatableFormStep<T = unknown>(
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

function datatableFormStep<T = unknown>(
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

	const stepName = typeof scrollOrName === 'string' ? scrollOrName : name;
	const scroll = typeof scrollOrName === 'number' ? scrollOrName : 10;

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

export const outputBuilderMethods: OutputBuilderMethods & ThisType<FormBuilder> = {
	alert(message, name) {
		return this.addSideEffect(() => alert(message), name);
	},
	clear(name) {
		return this.addSideEffect(() => clear(), name);
	},
	dataTable: dataTableFormStep,
	datatable: datatableFormStep,
	error(message, name) {
		return this.addSideEffect(() => error(message), name);
	},
	grid(items = [], maxWidth, name) {
		return this.addSideEffect(() => grid(items, maxWidth), name);
	},
	info(message, name) {
		return this.addSideEffect(() => info(message), name);
	},
	intro(message, name) {
		return this.addSideEffect(() => intro(message), name);
	},
	note(message, type = null, name) {
		return this.addSideEffect(() => note(message, type), name);
	},
	notify(message, body = '', subtitle = '', sound = '', icon = '', name) {
		return this.addSideEffect(() => notify(message, body, subtitle, sound, icon), name);
	},
	outro(message, name) {
		return this.addSideEffect(() => outro(message), name);
	},
	table: tableFormStep,
	title(value, name) {
		return this.addSideEffect(() => title(value), name);
	},
	warning(message, name) {
		return this.addSideEffect(() => warning(message), name);
	},
};
