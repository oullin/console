import { progress } from '#tui/status';
import { resolveProgressFormArguments } from '#tui/form/builder/validators/status';
import type { FormBuilder } from '#tui/form/builder/index';
import type { MaybePromise } from '#tui/types';
import type { Progress } from '#tui/status';

export function progressFormStep(this: FormBuilder, total: number, message?: string, name?: string): FormBuilder;

export function progressFormStep<T, R>(
	this: FormBuilder,
	label: string,
	steps: Iterable<T> | number,
	callback?: (step: T | number, bar: Progress) => MaybePromise<R>,
	hint?: string,
	name?: string,
): FormBuilder;

export function progressFormStep<T, R>(
	this: FormBuilder,
	labelOrTotal: string | number,
	stepsOrMessage?: Iterable<T> | number | string,
	callbackOrName?: ((step: T | number, bar: Progress) => MaybePromise<R>) | string,
	hint = '',
	name?: string,
): FormBuilder {
	const resolved = resolveProgressFormArguments<T, R>(labelOrTotal, stepsOrMessage, callbackOrName, hint, name);

	if (resolved.kind === 'total') {
		return this.addSideEffect(
			() => {
				const bar = progress(resolved.total, resolved.message);

				bar.start();
				bar.finish();
			},
			resolved.name,
		);
	}

	return this.add(() => progress(resolved.label, resolved.steps, resolved.callback, resolved.hint), resolved.name, true);
}
