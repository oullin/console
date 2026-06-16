import { z } from 'zod';
import { asyncIterableSchema, iterableSchema } from '#tui/validators/iterable';
import type { MaybePromise } from '#tui/types';
import type { Progress } from '#tui/status';

const progressTotalSchema = z.number();
const statusLabelSchema = z.string();
const statusCallbackSchema = z.function();
const progressCallbackSchema = z.function();

const streamSourceSchema = z.union([asyncIterableSchema<string>(), iterableSchema<string>()]);

export const isProgressTotal = (value: unknown): value is number => {
	return progressTotalSchema.safeParse(value).success;
};

export const isStatusLabel = (value: unknown): value is string => {
	return statusLabelSchema.safeParse(value).success;
};

export const parseStatusLabel = (value: unknown): string | undefined => {
	const parsed = statusLabelSchema.safeParse(value);

	return parsed.success ? parsed.data : undefined;
};

export const parseStatusCallback = <T>(value: unknown): (() => MaybePromise<T>) => {
	const parsed = statusCallbackSchema.safeParse(value);

	if (!parsed.success) {
		throw new Error('A status callback is required.');
	}

	return parsed.data as () => MaybePromise<T>;
};

export const parseProgressCallback = <T, R>(value: unknown): ((step: T | number, bar: Progress) => MaybePromise<R>) | undefined => {
	const parsed = progressCallbackSchema.safeParse(value);

	return parsed.success ? (parsed.data as (step: T | number, bar: Progress) => MaybePromise<R>) : undefined;
};

export const isStreamSource = (value: unknown): value is AsyncIterable<string> | Iterable<string> => {
	return streamSourceSchema.safeParse(value).success;
};
