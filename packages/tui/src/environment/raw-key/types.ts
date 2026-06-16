import type { EventEmitter } from 'node:events';

export type RawKeyInput = Pick<EventEmitter, 'off' | 'on' | 'once'> & {
	isRaw?: boolean;
	isTTY?: boolean;
	pause(): unknown;
	resume(): unknown;
	setRawMode?(mode: boolean): unknown;
};
