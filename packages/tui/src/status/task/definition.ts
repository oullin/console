import { isTaskTitle, parseTaskCallback } from '#tui/status/task/validators/definition';
import type { Logger } from '#tui/status/task/logger';
import type { MaybePromise } from '#tui/types';

export type TaskDefinition<T> = {
	keepSummary?: boolean;
	subLabel?: string;
	title: string;
	limit?: number;
	task: (logger: Logger) => MaybePromise<T>;
};

export type ResolvedTaskDefinition<T> = {
	keepSummary: boolean;
	limit: number;
	run: (logger: Logger) => MaybePromise<T>;
	subLabel: string;
	title: string;
};

export const resolveTaskDefinition = <T>(
	definitionOrLabel: TaskDefinition<T> | string,
	callback?: (logger: Logger) => MaybePromise<T>,
	limit = 10,
	keepSummary = false,
	subLabel?: string,
): ResolvedTaskDefinition<T> => {
	if (isTaskTitle(definitionOrLabel)) {
		return {
			keepSummary,
			limit,
			run: parseTaskCallback(callback),
			subLabel: subLabel ?? '',
			title: definitionOrLabel,
		};
	}

	return {
		keepSummary: definitionOrLabel.keepSummary ?? keepSummary,
		limit: definitionOrLabel.limit ?? limit,
		run: definitionOrLabel.task,
		subLabel: definitionOrLabel.subLabel ?? subLabel ?? '',
		title: definitionOrLabel.title,
	};
};
