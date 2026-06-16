import { Key } from '#tui/key/constants';
import { isKeyValueList, parseKeyLookupName } from '#tui/key/validators/value';
import type { KeyValue } from '#tui/key/types';

export const keyValueFromName = (name: string): KeyValue | undefined => {
	const keyName = parseKeyLookupName(name);

	if (keyName === undefined) {
		return undefined;
	}

	return Key[keyName];
};

export const firstKeyValue = (key: KeyValue): string => (isKeyValueList(key) ? key[0] : key);
