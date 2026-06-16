import { z } from 'zod';
import type { MaybePromise, StatusOptions } from '#tui/types';

const spinnerCallbackSchema = <T>(): z.ZodType<() => MaybePromise<T>> => z.function() as z.ZodType<() => MaybePromise<T>>;
const spinnerMessageSchema = z.string();
const spinnerOptionsSchema = z
	.object({
		message: spinnerMessageSchema.default(''),
	})
	.passthrough()
	.default({ message: '' });

export const isSpinnerCallback = <T>(value: unknown): value is () => MaybePromise<T> => {
	return spinnerCallbackSchema<T>().safeParse(value).success;
};

export const isSpinnerMessage = (value: unknown): value is string => {
	return spinnerMessageSchema.safeParse(value).success;
};

export const parseSpinnerCallback = <T>(value: unknown): (() => MaybePromise<T>) => {
	const parsed = spinnerCallbackSchema<T>().safeParse(value);

	if (!parsed.success) {
		throw new Error('A spinner callback is required.');
	}

	return parsed.data;
};

export const parseSpinnerOptions = (value: unknown): StatusOptions => {
	return spinnerOptionsSchema.parse(value);
};
