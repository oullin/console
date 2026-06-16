import { progress } from '#tui/status';
import { isProgressTotal, isStatusLabel, parseProgressCallback, parseStatusLabel } from '#tui/form/builder/validators/status';
import { progressStepsArgument } from '#tui/status/progress/validators/arguments';
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
	if (isProgressTotal(labelOrTotal)) {
		const message = isStatusLabel(stepsOrMessage) ? stepsOrMessage : undefined;

		return this.addSideEffect(
			() => {
				const bar = progress(labelOrTotal, message);

				bar.start();
				bar.finish();
			},
			parseStatusLabel(callbackOrName),
		);
	}

	return this.add(() => progress(labelOrTotal, progressStepsArgument<T>(stepsOrMessage), parseProgressCallback<T, R>(callbackOrName), hint), name, true);
}
