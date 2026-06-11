import { progress, spin, stream, task } from '#tui/status';
import { sideEffectStep } from '#tui/form/builder/step';
import type { FormBuilder } from '#tui/form/builder/index';
import type { MaybePromise } from '#tui/types';
import type { Logger, Progress } from '#tui/status';

export type StatusBuilderMethods = {
	progress<T, R>(this: FormBuilder, label: string, steps: Iterable<T> | number, callback?: (step: T | number, bar: Progress) => MaybePromise<R>, hint?: string, name?: string): FormBuilder;
	spin<T>(this: FormBuilder, callback: () => MaybePromise<T>, message?: string, name?: string): FormBuilder;
	stream(this: FormBuilder, source: AsyncIterable<string> | Iterable<string>, name?: string): FormBuilder;
	task<T>(this: FormBuilder, label: string, callback: (logger: Logger) => MaybePromise<T>, limit?: number, keepSummary?: boolean, subLabel?: string, name?: string): FormBuilder;
};

export const statusBuilderMethods: StatusBuilderMethods & ThisType<FormBuilder> = {
	progress<T, R>(label: string, steps: Iterable<T> | number, callback?: (step: T | number, bar: Progress) => MaybePromise<R>, hint = '', name?: string) {
		return this.add(() => progress(label, steps, callback, hint), name, true);
	},
	spin<T>(callback: () => MaybePromise<T>, message = 'Loading', name?: string) {
		return this.add(() => spin(callback, { message }), name, true);
	},
	stream(source: AsyncIterable<string> | Iterable<string>, name?: string) {
		return this.add(
			sideEffectStep(() => stream(source)),
			name,
			true,
		);
	},
	task<T>(label: string, callback: (logger: Logger) => MaybePromise<T>, limit = 10, keepSummary = false, subLabel = '', name?: string) {
		return this.add(() => task(label, callback, limit, keepSummary, subLabel), name);
	},
};
