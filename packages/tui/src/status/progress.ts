import { Progress } from '#tui/status/progress/progress';
import { runProgressSteps } from '#tui/status/progress/run';
import { progressValues } from '#tui/status/progress/steps';
import type { MaybePromise } from '#tui/types';

export { Progress };
export type { ProgressSignalTarget } from '#tui/status/progress/progress';

export function progress(total: number, message?: string): Progress;

export function progress<T, R>(label: string, steps: Iterable<T> | number, callback?: (step: T | number, progress: Progress) => MaybePromise<R>, hint?: string): Progress | Promise<R[]>;

export function progress<T, R>(
	labelOrTotal: string | number,
	stepsOrMessage?: Iterable<T> | number | string,
	callback?: (step: T | number, progress: Progress) => MaybePromise<R>,
	hint = '',
): Progress | Promise<R[]> {
	if (typeof labelOrTotal === 'number') {
		return new Progress(labelOrTotal, typeof stepsOrMessage === 'string' ? stepsOrMessage : undefined);
	}

	const steps = stepsOrMessage ?? 0;

	if (typeof steps === 'string') {
		throw new Error('Progress steps must be an iterable or a number.');
	}

	const values = progressValues(steps);
	const bar = new Progress(values.length, labelOrTotal, hint);

	if (!callback) {
		return bar;
	}

	return runProgressSteps(bar, values, callback);
}
