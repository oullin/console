import { Key } from '#tui/key/constants';
import { ctrlKeyMap, namedKeyMap } from '#tui/key/event/maps';
import { firstKeyValue, keyValueFromName } from '#tui/key/event/value';
import { parseKeyboardEvent } from '#tui/key/validators/event';
import type { KeyboardEventLike, KeyName } from '#tui/key/types';

export const keyFromEvent = (event: KeyboardEventLike): KeyName | string => {
	const parsedEvent = parseKeyboardEvent(event);

	if (parsedEvent.ctrl && parsedEvent.name) {
		const key = ctrlKeyMap[parsedEvent.name.toLowerCase()];

		if (key !== undefined) {
			return key;
		}
	}

	if (parsedEvent.meta && parsedEvent.name === 'backspace') {
		return Key.optionBackspace;
	}

	if (parsedEvent.shift && parsedEvent.name?.toLowerCase() === 'tab') {
		return Key.shiftTab;
	}

	if (parsedEvent.name) {
		const key = namedKeyMap[parsedEvent.name.toLowerCase()];

		if (key !== undefined) {
			return key;
		}
	}

	if (parsedEvent.name) {
		const key = keyValueFromName(parsedEvent.name);

		if (key !== undefined) {
			return firstKeyValue(key);
		}
	}

	if (parsedEvent.sequence === ' ') {
		return Key.space;
	}

	if (parsedEvent.sequence === '\r' || parsedEvent.sequence === '\n') {
		return Key.enter;
	}

	return parsedEvent.name ?? parsedEvent.sequence ?? '';
};
