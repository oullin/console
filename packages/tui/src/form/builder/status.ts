import { progress, spin, stream, task } from '#tui/status';
import { sideEffectStep } from '#tui/form/builder/step';
import type { FormBuilder } from '#tui/form/builder/index';
import type { MaybePromise } from '#tui/types';
import type { Logger, Progress, Stream, TaskDefinition } from '#tui/status';

export type StatusBuilderMethods = {
	progress(this: FormBuilder, total: number, message?: string, name?: string): FormBuilder;
	progress<T, R>(this: FormBuilder, label: string, steps: Iterable<T> | number, callback?: (step: T | number, bar: Progress) => MaybePromise<R>, hint?: string, name?: string): FormBuilder;
	spin<T>(this: FormBuilder, callback: () => MaybePromise<T>, message?: string, name?: string): FormBuilder;
	spin<T>(this: FormBuilder, message: string, callback: () => MaybePromise<T>, name?: string): FormBuilder;
	task<T>(this: FormBuilder, definition: TaskDefinition<T>, name?: string): FormBuilder;
	stream(this: FormBuilder): FormBuilder;
	stream(this: FormBuilder, source: AsyncIterable<string> | Iterable<string>, name?: string): FormBuilder;
	task<T>(this: FormBuilder, label: string, callback: (logger: Logger) => MaybePromise<T>, limit?: number, keepSummary?: boolean, subLabel?: string, name?: string): FormBuilder;
};

export const statusBuilderMethods: StatusBuilderMethods & ThisType<FormBuilder> = {
	progress<T, R>(
		labelOrTotal: string | number,
		stepsOrMessage?: Iterable<T> | number | string,
		callbackOrName?: ((step: T | number, bar: Progress) => MaybePromise<R>) | string,
		hint = '',
		name?: string,
	) {
		if (typeof labelOrTotal === 'number') {
			return this.add(() => progress(labelOrTotal, typeof stepsOrMessage === 'string' ? stepsOrMessage : undefined), callbackOrName as string | undefined, true);
		}

		return this.add(() => progress(labelOrTotal, stepsOrMessage as Iterable<T> | number, callbackOrName as (step: T | number, bar: Progress) => MaybePromise<R>, hint), name, true);
	},
	spin<T>(callbackOrMessage: (() => MaybePromise<T>) | string, messageOrCallback: string | (() => MaybePromise<T>) = '', name?: string) {
		if (typeof callbackOrMessage === 'string') {
			return this.add(() => spin(callbackOrMessage, messageOrCallback as () => MaybePromise<T>), name, true);
		}

		return this.add(() => spin(callbackOrMessage, { message: messageOrCallback as string }), name, true);
	},
	stream(source?: AsyncIterable<string> | Iterable<string>, name?: string) {
		if (source === undefined) {
			return this.add(() => stream() as Stream);
		}

		return this.add(
			sideEffectStep(() => stream(source)),
			name,
			true,
		);
	},
	task<T>(definitionOrLabel: TaskDefinition<T> | string, callbackOrName?: ((logger: Logger) => MaybePromise<T>) | string, limit = 10, keepSummary = false, subLabel = '', name?: string) {
		if (typeof definitionOrLabel === 'string') {
			return this.add(() => task(definitionOrLabel, callbackOrName as (logger: Logger) => MaybePromise<T>, limit, keepSummary, subLabel), name);
		}

		return this.add(() => task(definitionOrLabel), callbackOrName as string | undefined);
	},
};
