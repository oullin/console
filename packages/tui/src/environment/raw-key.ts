import type { EventEmitter } from 'node:events';
import { normalizeRawKey } from '#tui/environment/raw-key/normalize';

export type RawKeyInput = Pick<EventEmitter, 'off' | 'once'> & {
	isRaw?: boolean;
	isTTY?: boolean;
	pause(): unknown;
	resume(): unknown;
	setRawMode?(mode: boolean): unknown;
};

const restoreInput = (input: RawKeyInput, wasRaw: boolean): void => {
	if (!input.isTTY) {
		return;
	}

	try {
		input.setRawMode?.(wasRaw);
	} finally {
		input.pause();
	}
};

export const readRawKey = async (input: RawKeyInput): Promise<null | string> =>
	new Promise((resolve, reject) => {
		const wasRaw = Boolean(input.isRaw);

		const cleanup = (): void => {
			input.off('data', onData);
			input.off('end', onEnd);
			input.off('error', onError);
			restoreInput(input, wasRaw);
		};

		const onData = (chunk: Buffer | string): void => {
			cleanup();
			resolve(normalizeRawKey(Buffer.isBuffer(chunk) ? chunk.toString('utf8') : chunk));
		};

		const onEnd = (): void => {
			cleanup();
			resolve(null);
		};

		const onError = (error: Error): void => {
			cleanup();
			reject(error);
		};

		input.once('data', onData);
		input.once('end', onEnd);
		input.once('error', onError);

		if (input.isTTY) {
			try {
				input.setRawMode?.(true);
				input.resume();
			} catch (error) {
				cleanup();
				reject(error);
			}
		}
	});
