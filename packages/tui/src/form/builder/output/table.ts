import { dataTable, table } from '#tui/output';
import { parseOutputTableRows } from '#tui/form/builder/validators/output';
import { isTableOptions, tableStepName } from '#tui/output/validators/table';
import type { FormBuilder } from '#tui/form/builder/index';
import type { TableOptions } from '#tui/types';

export function dataTableFormStep(this: FormBuilder, options: TableOptions, name?: string): FormBuilder;

export function dataTableFormStep(this: FormBuilder, headersOrOptions?: TableOptions | string[], rows?: TableOptions['rows'] | null, name?: string): FormBuilder;

export function dataTableFormStep(this: FormBuilder, headersOrOptions: TableOptions | string[] = [], rowsOrName: TableOptions['rows'] | string | null = null, name?: string): FormBuilder {
	if (isTableOptions(headersOrOptions)) {
		return this.addSideEffect(() => dataTable(headersOrOptions), tableStepName(rowsOrName));
	}

	return this.addSideEffect(() => dataTable(headersOrOptions, parseOutputTableRows(rowsOrName)), name);
}

export function tableFormStep(this: FormBuilder, options: TableOptions, name?: string): FormBuilder;

export function tableFormStep(this: FormBuilder, headersOrOptions?: TableOptions | string[], rows?: TableOptions['rows'] | null, name?: string): FormBuilder;

export function tableFormStep(this: FormBuilder, headersOrOptions: TableOptions | string[] = [], rowsOrName: TableOptions['rows'] | string | null = null, name?: string): FormBuilder {
	if (isTableOptions(headersOrOptions)) {
		return this.addSideEffect(() => table(headersOrOptions), tableStepName(rowsOrName));
	}

	return this.addSideEffect(() => table(headersOrOptions, parseOutputTableRows(rowsOrName)), name);
}
