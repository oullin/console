import { isCompleteRawKey, normalizeRawKey } from '#tui/environment/raw-key/normalize';
import { parseRawKeyChunkText } from '#tui/environment/raw-key/validators/chunk';
import type { RawKeyInputMode } from '#tui/environment/raw-key/mode';
import type { RawKeyInput } from '#tui/environment/raw-key/types';

type RawKeySessionHandlers = {
	onData(chunk: Buffer | string): void;
	onEnd(): void;
	onError(error: Error): void;
};

export const createRawKeySession = (input: RawKeyInput, mode: RawKeyInputMode, resolve: (value: null | string) => void, reject: (reason?: unknown) => void): RawKeySessionHandlers => {
	let buffer = '';
	let escapeTimer: NodeJS.Timeout | undefined;

	const cleanup = (): void => {
		clearTimeout(escapeTimer);
		input.off('data', handlers.onData);
		input.off('end', handlers.onEnd);
		input.off('error', handlers.onError);
		mode.restore();
	};

	const resolveBufferedKey = (): void => {
		cleanup();
		resolve(normalizeRawKey(buffer));
	};

	const handlers: RawKeySessionHandlers = {
		onData(chunk) {
			buffer += parseRawKeyChunkText(chunk);

			if (isCompleteRawKey(buffer)) {
				resolveBufferedKey();

				return;
			}

			clearTimeout(escapeTimer);
			escapeTimer = setTimeout(resolveBufferedKey, 25);
		},
		onEnd() {
			cleanup();
			resolve(buffer.length > 0 ? normalizeRawKey(buffer) : null);
		},
		onError(error) {
			cleanup();
			reject(error);
		},
	};

	return handlers;
};
