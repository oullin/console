import { z } from 'zod';

const progressTotalSchema = z.number();
const statusLabelSchema = z.string();

const streamSourceSchema = z.union([
	z.custom<AsyncIterable<string>>((value) => value !== null && value !== undefined && Symbol.asyncIterator in Object(value)),
	z.custom<Iterable<string>>((value) => typeof value !== 'string' && value !== null && value !== undefined && Symbol.iterator in Object(value)),
]);

export const isProgressTotal = (value: unknown): value is number => {
	return progressTotalSchema.safeParse(value).success;
};

export const isStatusLabel = (value: unknown): value is string => {
	return statusLabelSchema.safeParse(value).success;
};

export const isStreamSource = (value: unknown): value is AsyncIterable<string> | Iterable<string> => {
	return streamSourceSchema.safeParse(value).success;
};
