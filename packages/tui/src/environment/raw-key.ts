import type { EventEmitter } from 'node:events';
import { isCompleteRawKey, normalizeRawKey } from '#tui/environment/raw-key/normalize';

export type RawKeyInput = Pick<EventEmitter, 'off' | 'on' | 'once'> & {
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

		let buffer = '';
		let escapeTimer: NodeJS.Timeout | undefined;

		const cleanup = (): void => {
			clearTimeout(escapeTimer);
			input.off('data', onData);
			input.off('end', onEnd);
			input.off('error', onError);
			restoreInput(input, wasRaw);
		};

		const resolveBufferedKey = (): void => {
			cleanup();
			resolve(normalizeRawKey(buffer));
		};

		const onData = (chunk: Buffer | string): void => {
			buffer += Buffer.isBuffer(chunk) ? chunk.toString('utf8') : chunk;

			if (isCompleteRawKey(buffer)) {
				resolveBufferedKey();

				return;
			}

			clearTimeout(escapeTimer);
			escapeTimer = setTimeout(resolveBufferedKey, 25);
		};

		const onEnd = (): void => {
			cleanup();
			resolve(buffer.length > 0 ? normalizeRawKey(buffer) : null);
		};

		const onError = (error: Error): void => {
			cleanup();
			reject(error);
		};

		input.on('data', onData);
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
