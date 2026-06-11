export const Key = {
	up: '\u001B[A',
	shiftUp: '\u001B[1;2A',
	pageUp: '\u001B[5~',
	down: '\u001B[B',
	shiftDown: '\u001B[1;2B',
	pageDown: '\u001B[6~',
	right: '\u001B[C',
	left: '\u001B[D',
	upArrow: '\u001BOA',
	downArrow: '\u001BOB',
	rightArrow: '\u001BOC',
	leftArrow: '\u001BOD',
	escape: '\u001B',
	delete: '\u001B[3~',
	backspace: '\u007F',
	enter: '\n',
	space: ' ',
	tab: '\t',
	shiftTab: '\u001B[Z',
	home: ['\u001B[1~', '\u001BOH', '\u001B[H', '\u001B[7~'],
	end: ['\u001B[4~', '\u001BOF', '\u001B[F', '\u001B[8~'],
	ctrlC: '\u0003',
	ctrlP: '\u0010',
	ctrlN: '\u000E',
	ctrlF: '\u0006',
	ctrlB: '\u0002',
	ctrlH: '\u0008',
	ctrlA: '\u0001',
	ctrlD: '\u0004',
	ctrlE: '\u0005',
	ctrlU: '\u0015',
	optionBackspace: '\u001B\u007F',
} as const;

export type KeyValue = string | readonly string[];

export type KeyName = Extract<(typeof Key)[keyof typeof Key], string>;

export type KeyboardEventLike = {
	name?: string;
	sequence?: string;
	ctrl?: boolean;
	meta?: boolean;
	shift?: boolean;
};

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

	if (event.name && event.name in Key) {
		const key = Key[event.name as keyof typeof Key];

		return typeof key === 'string' ? key : key[0];
	}

	if (event.sequence === ' ') {
		return Key.space;
	}

	if (event.sequence === '\r' || event.sequence === '\n') {
		return Key.enter;
	}

	return event.name ?? event.sequence ?? '';
};

export const oneOf = (keys: KeyValue[], match: string): string | undefined => {
	for (const key of keys) {
		if (Array.isArray(key)) {
			const nested = oneOf([...key], match);

			if (nested !== undefined) {
				return nested;
			}
		} else if (key === match) {
			return match;
		}
	}

	return undefined;
};
