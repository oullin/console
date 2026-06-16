import { z } from 'zod';
import type { KeyValue } from '#tui/key/types';

const keyValueListSchema = z.array(z.string()).readonly();

export const isKeyValueList = (value: KeyValue): value is readonly string[] => {
	return keyValueListSchema.safeParse(value).success;
};
