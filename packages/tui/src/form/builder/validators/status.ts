import { z } from 'zod';
import { progressStepsArgument } from '#tui/status/progress/validators/arguments';
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

export type ResolvedSpinFormArguments<T> =
	| {
			callback: () => MaybePromise<T>;
			kind: 'message';
			message: string;
			name?: string;
	  }
	| {
			callback: () => MaybePromise<T>;
			kind: 'callback';
			message: string;
			name?: string;
	  };

export type ResolvedProgressFormArguments<T, R> =
	| {
			kind: 'total';
			message?: string;
			name?: string;
			total: number;
	  }
	| {
			callback?: (step: T | number, bar: Progress) => MaybePromise<R>;
			hint: string;
			kind: 'label';
			label: string;
			name?: string;
			steps: Iterable<T> | number;
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

export const resolveSpinFormArguments = <T>(
	callbackOrMessage: (() => MaybePromise<T>) | string,
	messageOrCallback: string | (() => MaybePromise<T>) = '',
	name?: string,
): ResolvedSpinFormArguments<T> => {
	if (isStatusLabel(callbackOrMessage)) {
		return {
			callback: parseStatusCallback<T>(messageOrCallback),
			kind: 'message',
			message: callbackOrMessage,
			name,
		};
	}

	return {
		callback: parseStatusCallback<T>(callbackOrMessage),
		kind: 'callback',
		message: parseStatusLabel(messageOrCallback) ?? '',
		name,
	};
};

export const resolveProgressFormArguments = <T, R>(
	labelOrTotal: string | number,
	stepsOrMessage?: Iterable<T> | number | string,
	callbackOrName?: ((step: T | number, bar: Progress) => MaybePromise<R>) | string,
	hint = '',
	name?: string,
): ResolvedProgressFormArguments<T, R> => {
	if (isProgressTotal(labelOrTotal)) {
		return {
			kind: 'total',
			message: isStatusLabel(stepsOrMessage) ? stepsOrMessage : undefined,
			name: parseStatusLabel(callbackOrName),
			total: labelOrTotal,
		};
	}

	return {
		callback: parseProgressCallback<T, R>(callbackOrName),
		hint,
		kind: 'label',
		label: labelOrTotal,
		name,
		steps: progressStepsArgument<T>(stepsOrMessage),
	};
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
