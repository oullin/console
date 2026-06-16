import { z } from 'zod';
import type { MaybePromise, StatusOptions } from '#tui/types';

const spinnerCallbackSchema = z.function();
const spinnerMessageSchema = z.string();
const spinnerOptionsSchema = z
	.object({
		message: spinnerMessageSchema.default(''),
	})
	.passthrough()
	.default({ message: '' });

export const isSpinnerCallback = <T>(value: unknown): value is () => MaybePromise<T> => {
	return spinnerCallbackSchema.safeParse(value).success;
};

export const isSpinnerMessage = (value: unknown): value is string => {
	return spinnerMessageSchema.safeParse(value).success;
};

export const parseSpinnerCallback = <T>(value: unknown): (() => MaybePromise<T>) => {
	const parsed = spinnerCallbackSchema.safeParse(value);

	if (!parsed.success) {
		throw new Error('A spinner callback is required.');
	}

	return parsed.data as () => MaybePromise<T>;
};

export const parseSpinnerOptions = (value: unknown): StatusOptions => {
	return spinnerOptionsSchema.parse(value);
};
