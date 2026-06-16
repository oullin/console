import { z } from 'zod';
import { parseTaskCallback } from '#tui/status/task/validators/definition';
import { asyncIterableSchema, iterableSchema } from '#tui/validators/iterable';
import type { MaybePromise } from '#tui/types';
import type { Progress, TaskDefinition } from '#tui/status';
import type { Logger } from '#tui/status/task/logger';

const progressTotalSchema = z.number();
const statusLabelSchema = z.string();
const statusCallbackSchema = <T>(): z.ZodType<() => MaybePromise<T>> => z.function() as z.ZodType<() => MaybePromise<T>>;
const progressCallbackSchema = <T, R>(): z.ZodType<(step: T | number, bar: Progress) => MaybePromise<R>> =>
	z.function() as z.ZodType<(step: T | number, bar: Progress) => MaybePromise<R>>;

const streamSourceSchema = z.union([asyncIterableSchema<string>(), iterableSchema<string>()]);

export type ResolvedStreamFormArguments =
	| {
			kind: 'manual';
			name?: string;
	  }
	| {
			kind: 'source';
			name?: string;
			source: AsyncIterable<string> | Iterable<string>;
	  };

export type ResolvedTaskFormArguments<T> =
	| {
			callback: (logger: Logger) => MaybePromise<T>;
			keepSummary: boolean;
			kind: 'label';
			label: string;
			limit: number;
			name?: string;
			subLabel: string;
	  }
	| {
			definition: TaskDefinition<T>;
			kind: 'definition';
			name?: string;
	  };

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

export const resolveStreamFormArguments = (sourceOrName?: AsyncIterable<string> | Iterable<string> | string, name?: string): ResolvedStreamFormArguments => {
	if (isStatusLabel(sourceOrName)) {
		return { kind: 'manual', name: sourceOrName };
	}

	if (!isStreamSource(sourceOrName)) {
		return { kind: 'manual' };
	}

	return { kind: 'source', name, source: sourceOrName };
};

export const resolveTaskFormArguments = <T>(
	definitionOrLabel: TaskDefinition<T> | string,
	callbackOrName?: ((logger: Logger) => MaybePromise<T>) | string,
	limit = 10,
	keepSummary = false,
	subLabel = '',
	name?: string,
): ResolvedTaskFormArguments<T> => {
	if (isStatusLabel(definitionOrLabel)) {
		return {
			callback: parseTaskCallback<T>(callbackOrName),
			keepSummary,
			kind: 'label',
			label: definitionOrLabel,
			limit,
			name,
			subLabel,
		};
	}

	return {
		definition: definitionOrLabel,
		kind: 'definition',
		name: parseStatusLabel(callbackOrName),
	};
};
