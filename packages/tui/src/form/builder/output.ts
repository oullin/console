import { alert, clear, dataTable, datatable, error, grid, info, intro, note, notify, outro, table, title, warning } from '#tui/output';
import { sideEffectStep } from '#tui/form/builder/step';
import { isTableOptions, tableStepName } from '#tui/output/validators/table';
import type { FormBuilder } from '#tui/form/builder/index';
import type { DataTablePromptOptions, DataTableRow, MaybePromise, TableOptions } from '#tui/types';

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

const displayStep = (callback: () => void): (() => MaybePromise<null>) => sideEffectStep(callback);

function dataTableFormStep(this: FormBuilder, options: TableOptions, name?: string): FormBuilder;
function dataTableFormStep(this: FormBuilder, headersOrOptions?: TableOptions | string[], rows?: TableOptions['rows'] | null, name?: string): FormBuilder;

function dataTableFormStep(this: FormBuilder, headersOrOptions: TableOptions | string[] = [], rowsOrName: TableOptions['rows'] | string | null = null, name?: string): FormBuilder {
	if (isTableOptions(headersOrOptions)) {
		return this.add(
			displayStep(() => dataTable(headersOrOptions)),
			tableStepName(rowsOrName),
			true,
		);
	}

	return this.add(
		displayStep(() => dataTable(headersOrOptions, rowsOrName as TableOptions['rows'] | null)),
		name,
		true,
	);
}

function tableFormStep(this: FormBuilder, options: TableOptions, name?: string): FormBuilder;
function tableFormStep(this: FormBuilder, headersOrOptions?: TableOptions | string[], rows?: TableOptions['rows'] | null, name?: string): FormBuilder;

function tableFormStep(this: FormBuilder, headersOrOptions: TableOptions | string[] = [], rowsOrName: TableOptions['rows'] | string | null = null, name?: string): FormBuilder {
	if (isTableOptions(headersOrOptions)) {
		return this.add(
			displayStep(() => table(headersOrOptions)),
			tableStepName(rowsOrName),
			true,
		);
	}

	return this.add(
		displayStep(() => table(headersOrOptions, rowsOrName as TableOptions['rows'] | null)),
		name,
		true,
	);
}

export const outputBuilderMethods: OutputBuilderMethods & ThisType<FormBuilder> = {
	alert(message, name) {
		return this.add(
			displayStep(() => alert(message)),
			name,
			true,
		);
	},
	clear(name) {
		return this.add(
			displayStep(() => clear()),
			name,
			true,
		);
	},
	dataTable: dataTableFormStep,
	datatable<T = unknown>(
		optionsOrHeaders: DataTablePromptOptions<T> | string[] = [],
		rowsOrName: Array<DataTableRow<T>> | null | string = null,
		scroll = 10,
		label = '',
		hint = '',
		required: DataTablePromptOptions<T>['required'] = false,
		validate: DataTablePromptOptions<T>['validate'] = undefined,
		transform: DataTablePromptOptions<T>['transform'] = undefined,
		filter: DataTablePromptOptions<T>['filter'] = undefined,
		name?: string,
	) {
		if (Array.isArray(optionsOrHeaders)) {
			return this.add(() => datatable(optionsOrHeaders, rowsOrName as Array<DataTableRow<T>> | null, scroll, label, hint, required, validate, transform, filter), name);
		}

		return this.add(() => datatable(optionsOrHeaders), rowsOrName as string | undefined);
	},
	error(message, name) {
		return this.add(
			displayStep(() => error(message)),
			name,
			true,
		);
	},
	grid(items = [], maxWidth, name) {
		return this.add(
			displayStep(() => grid(items, maxWidth)),
			name,
			true,
		);
	},
	info(message, name) {
		return this.add(
			displayStep(() => info(message)),
			name,
			true,
		);
	},
	intro(message, name) {
		return this.add(
			displayStep(() => intro(message)),
			name,
			true,
		);
	},
	note(message, type = null, name) {
		return this.add(
			displayStep(() => note(message, type)),
			name,
			true,
		);
	},
	notify(message, body = '', subtitle = '', sound = '', icon = '', name) {
		return this.add(
			displayStep(() => notify(message, body, subtitle, sound, icon)),
			name,
			true,
		);
	},
	outro(message, name) {
		return this.add(
			displayStep(() => outro(message)),
			name,
			true,
		);
	},
	table: tableFormStep,
	title(value, name) {
		return this.add(
			displayStep(() => title(value)),
			name,
			true,
		);
	},
	warning(message, name) {
		return this.add(
			displayStep(() => warning(message)),
			name,
			true,
		);
	},
};
