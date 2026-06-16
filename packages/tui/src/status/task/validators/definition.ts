import { z } from 'zod';
import type { Logger } from '#tui/status/task/logger';
import type { MaybePromise } from '#tui/types';

const taskCallbackSchema = <T>(): z.ZodType<(logger: Logger) => MaybePromise<T>> => z.function() as z.ZodType<(logger: Logger) => MaybePromise<T>>;
const taskTitleSchema = z.string();

export const isTaskTitle = (value: unknown): value is string => {
	return taskTitleSchema.safeParse(value).success;
};

export const parseTaskCallback = <T>(value: unknown): ((logger: Logger) => MaybePromise<T>) => {
	const parsed = taskCallbackSchema<T>().safeParse(value);

	if (!parsed.success) {
		throw new Error('A task callback is required.');
	}

	return parsed.data;
};
