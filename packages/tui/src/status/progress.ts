import { Progress } from '#tui/status/progress/progress';
import { runProgressSteps } from '#tui/status/progress/run';
import { progressValues } from '#tui/status/progress/steps';
import {
	isProgressTotalArgument,
	progressMessageArgument,
	progressStepsArgument,
} from '#tui/status/progress/validators/arguments';
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
	if (isProgressTotalArgument(labelOrTotal)) {
		return new Progress(labelOrTotal, progressMessageArgument(stepsOrMessage));
	}

	const values = progressValues(progressStepsArgument(stepsOrMessage));
	const bar = new Progress(values.length, labelOrTotal, hint);

	if (!callback) {
		return bar;
	}

	return runProgressSteps(bar, values, callback);
}
