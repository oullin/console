import { z } from 'zod';
import { asyncIterableSchema, iterableSchema } from '#tui/validators/iterable';
import type { MaybePromise } from '#tui/types';
import type { Progress } from '#tui/status';

const progressTotalSchema = z.number();
const statusLabelSchema = z.string();
const statusCallbackSchema = <T>(): z.ZodType<() => MaybePromise<T>> => z.function() as z.ZodType<() => MaybePromise<T>>;
const progressCallbackSchema = <T, R>(): z.ZodType<(step: T | number, bar: Progress) => MaybePromise<R>> =>
	z.function() as z.ZodType<(step: T | number, bar: Progress) => MaybePromise<R>>;

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
	const parsed = statusCallbackSchema<T>().safeParse(value);

	if (!parsed.success) {
		throw new Error('A status callback is required.');
	}

	return parsed.data;
};

export const parseProgressCallback = <T, R>(value: unknown): ((step: T | number, bar: Progress) => MaybePromise<R>) | undefined => {
	const parsed = progressCallbackSchema<T, R>().safeParse(value);

	return parsed.success ? parsed.data : undefined;
};

export const isStreamSource = (value: unknown): value is AsyncIterable<string> | Iterable<string> => {
	return streamSourceSchema.safeParse(value).success;
};
