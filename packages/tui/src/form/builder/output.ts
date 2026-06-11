import { alert, datatable, error, info, intro, note, outro, table, warning } from '#tui/output';
import { sideEffectStep } from '#tui/form/builder/step';
import type { FormBuilder } from '#tui/form/builder/index';
import type { DataTablePromptOptions, MaybePromise, TableOptions } from '#tui/types';

export type OutputBuilderMethods = {
	alert(this: FormBuilder, message: string, name?: string): FormBuilder;
	datatable<T = unknown>(this: FormBuilder, options: DataTablePromptOptions<T>, name?: string): FormBuilder;
	error(this: FormBuilder, message: string, name?: string): FormBuilder;
	info(this: FormBuilder, message: string, name?: string): FormBuilder;
	intro(this: FormBuilder, message: string, name?: string): FormBuilder;
	note(this: FormBuilder, message: string, type?: string | null, name?: string): FormBuilder;
	outro(this: FormBuilder, message: string, name?: string): FormBuilder;
	table(this: FormBuilder, headersOrOptions?: TableOptions | string[], rows?: TableOptions['rows'] | null, name?: string): FormBuilder;
	warning(this: FormBuilder, message: string, name?: string): FormBuilder;
};

const displayStep = (callback: () => void): (() => MaybePromise<null>) => sideEffectStep(callback);

export const outputBuilderMethods: OutputBuilderMethods & ThisType<FormBuilder> = {
	alert(message, name) {
		return this.add(
			displayStep(() => alert(message)),
			name,
			true,
		);
	},
	datatable<T = unknown>(options: DataTablePromptOptions<T>, name?: string) {
		return this.add(() => datatable(options), name);
	},
	error(message, name) {
		return this.add(
			displayStep(() => error(message)),
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
	outro(message, name) {
		return this.add(
			displayStep(() => outro(message)),
			name,
			true,
		);
	},
	table(headersOrOptions = [], rows = null, name) {
		return this.add(
			displayStep(() => table(headersOrOptions, rows)),
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
