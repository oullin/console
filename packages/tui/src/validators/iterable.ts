import { z } from 'zod';

const iteratorMethodSchema = z.function();
const iteratorContainerSchema = z.object({ [Symbol.iterator]: iteratorMethodSchema }).passthrough();
const asyncIteratorContainerSchema = z.object({ [Symbol.asyncIterator]: iteratorMethodSchema }).passthrough();
const stringValueSchema = z.string();

const hasIteratorMethod = (value: unknown): boolean => iteratorContainerSchema.safeParse(value).success;

const hasAsyncIteratorMethod = (value: unknown): boolean => asyncIteratorContainerSchema.safeParse(value).success;

export const iterableSchema = <T>(): z.ZodType<Iterable<T>> =>
	z.custom<Iterable<T>>((value) => !stringValueSchema.safeParse(value).success && hasIteratorMethod(value));

export const asyncIterableSchema = <T>(): z.ZodType<AsyncIterable<T>> =>
	z.custom<AsyncIterable<T>>((value) => hasAsyncIteratorMethod(value));
