import { z } from 'zod';
import { asyncIterableSchema, iterableSchema } from '#tui/validators/iterable';

const progressTotalSchema = z.number();
const statusLabelSchema = z.string();

const streamSourceSchema = z.union([asyncIterableSchema<string>(), iterableSchema<string>()]);

export const isProgressTotal = (value: unknown): value is number => {
	return progressTotalSchema.safeParse(value).success;
};

export const isStatusLabel = (value: unknown): value is string => {
	return statusLabelSchema.safeParse(value).success;
};

export const isStreamSource = (value: unknown): value is AsyncIterable<string> | Iterable<string> => {
	return streamSourceSchema.safeParse(value).success;
};
