import { parseKeyMatchValues } from '#tui/key/validators/match';
import type { KeyValue } from '#tui/key/types';

export const oneOf = (keys: KeyValue[], match: string): string | undefined => {
	return parseKeyMatchValues(keys).includes(match) ? match : undefined;
};
