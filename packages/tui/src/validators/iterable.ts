import { z } from 'zod';

const iteratorMethodSchema = z.function();
const stringValueSchema = z.string();

const hasIteratorMethod = <T>(value: unknown, key: typeof Symbol.iterator | typeof Symbol.asyncIterator): boolean => {
	return iteratorMethodSchema.safeParse((value as Partial<AsyncIterable<T> & Iterable<T>> | null | undefined)?.[key]).success;
};

export const iterableSchema = <T>(): z.ZodType<Iterable<T>> =>
	z.custom<Iterable<T>>((value) => !stringValueSchema.safeParse(value).success && hasIteratorMethod<T>(value, Symbol.iterator));

export const asyncIterableSchema = <T>(): z.ZodType<AsyncIterable<T>> =>
	z.custom<AsyncIterable<T>>((value) => hasIteratorMethod<T>(value, Symbol.asyncIterator));
