import { Key } from '#tui/key/constants';
import { isKeyValueList } from '#tui/key/validators/value';
import type { KeyValue } from '#tui/key/types';

export const keyValueFromName = (name: string): KeyValue | undefined => {
	if (!(name in Key)) {
		return undefined;
	}

	return Key[name as keyof typeof Key];
};

export const firstKeyValue = (key: KeyValue): string => (isKeyValueList(key) ? key[0] : key);
