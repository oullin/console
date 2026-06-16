import type { EventEmitter } from 'node:events';

export type RawKeyInput = Pick<EventEmitter, 'off' | 'on' | 'once'> & {
	isPaused?(): boolean;
	isRaw?: boolean;
	isTTY?: boolean;
	pause(): unknown;
	resume(): unknown;
	setRawMode?(mode: boolean): unknown;
};
