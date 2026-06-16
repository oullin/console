import { Key } from '#tui/key/constants';
import type { KeyName } from '#tui/key/types';

export const ctrlKeyMap: Record<string, KeyName> = {
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

export const namedKeyMap: Record<string, KeyName> = {
	pagedown: Key.pageDown,
	pageup: Key.pageUp,
	return: Key.enter,
};
