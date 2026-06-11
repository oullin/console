import type { MaybePromise } from '#tui/types';

type ProgressRunner = {
	advance(): void;
	finish(): void;
	start(): void;
};

export const runProgressSteps = async <T, R, TProgress extends ProgressRunner>(
	progress: TProgress,
	values: Array<T | number>,
	callback: (step: T | number, progress: TProgress) => MaybePromise<R>,
): Promise<R[]> => {
	const results: R[] = [];

	progress.start();

	for (const value of values) {
		results.push(await callback(value, progress));

		progress.advance();
	}

	progress.finish();

	return results;
};
