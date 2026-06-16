import { Key } from '#tui/key/constants';
import { ctrlKeyMap, namedKeyMap } from '#tui/key/event/maps';
import { firstKeyValue, keyValueFromName } from '#tui/key/event/value';
import type { KeyboardEventLike, KeyName } from '#tui/key/types';

export const keyFromEvent = (event: KeyboardEventLike): KeyName | string => {
	if (event.ctrl && event.name) {
		const key = ctrlKeyMap[event.name.toLowerCase()];

		if (key !== undefined) {
			return key;
		}
	}

	if (event.meta && event.name === 'backspace') {
		return Key.optionBackspace;
	}

	if (event.shift && event.name?.toLowerCase() === 'tab') {
		return Key.shiftTab;
	}

	if (event.name) {
		const key = namedKeyMap[event.name.toLowerCase()];

		if (key !== undefined) {
			return key;
		}
	}

	if (event.name) {
		const key = keyValueFromName(event.name);

		if (key !== undefined) {
			return firstKeyValue(key);
		}
	}

	if (event.sequence === ' ') {
		return Key.space;
	}

	if (event.sequence === '\r' || event.sequence === '\n') {
		return Key.enter;
	}

	return event.name ?? event.sequence ?? '';
};
