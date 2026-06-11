import { Key } from '#tui/key/constants';
import type { KeyboardEventLike, KeyName, KeyValue } from '#tui/key/types';

const ctrlKeyMap: Record<string, KeyName> = {
	a: Key.ctrlA,
	b: Key.ctrlB,
	c: Key.ctrlC,
	d: Key.ctrlD,
	e: Key.ctrlE,
	f: Key.ctrlF,
	h: Key.ctrlH,
	n: Key.ctrlN,
	p: Key.ctrlP,
	u: Key.ctrlU,
};

const namedKeyMap: Record<string, KeyName> = {
	pagedown: Key.pageDown,
	pageup: Key.pageUp,
	return: Key.enter,
};

const keyValueFromName = (name: string): KeyValue | undefined => {
	if (!(name in Key)) {
		return undefined;
	}

	return Key[name as keyof typeof Key];
};

const firstKeyValue = (key: KeyValue): string => (typeof key === 'string' ? key : key[0]);

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
