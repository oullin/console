import { z } from 'zod';
import type { KeyValue } from '#tui/key/types';

const keyValueSchema = z.union([z.string().transform((value) => [value]), z.array(z.string()).transform((values) => [...values])]);

const keyValuesSchema = z.array(keyValueSchema).transform((values) => values.flat());

export const parseKeyMatchValues = (values: KeyValue[]): string[] => {
	return keyValuesSchema.parse(values);
};
