import { z } from 'zod';
import { Key } from '#tui/key/constants';
import type { KeyValue } from '#tui/key/types';

type KeyLookupName = keyof typeof Key;

const keyLookupNameSchema = z.enum(Object.keys(Key) as [KeyLookupName, ...KeyLookupName[]]);
const keyValueListSchema = z.array(z.string()).readonly();

export const isKeyValueList = (value: KeyValue): value is readonly string[] => {
	return keyValueListSchema.safeParse(value).success;
};

export const parseKeyLookupName = (value: unknown): KeyLookupName | undefined => {
	const parsed = keyLookupNameSchema.safeParse(value);

	return parsed.success ? parsed.data : undefined;
};
