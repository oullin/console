import type { KeyValue } from '#tui/key/types';

export const oneOf = (keys: KeyValue[], match: string): string | undefined => {
	for (const key of keys) {
		if (Array.isArray(key)) {
			const nested = oneOf([...key], match);

			if (nested !== undefined) {
				return nested;
			}

			continue;
		}

		if (key === match) {
			return match;
		}
	}

	return undefined;
};
