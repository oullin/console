export { FormBuilder } from '#tui/form/builder/index';
export type { FormResponses, FormStep } from '#tui/form/types';

import { FormBuilder } from '#tui/form/builder/index';
import type { MaybePromise } from '#tui/types';

export function form(): FormBuilder;

export function form<T>(builder: (form: FormBuilder) => MaybePromise<T>): Promise<T>;

export function form<T>(builder?: (form: FormBuilder) => MaybePromise<T>): FormBuilder | Promise<T> {
	const instance = new FormBuilder();

	return builder ? Promise.resolve(builder(instance)) : instance;
}
