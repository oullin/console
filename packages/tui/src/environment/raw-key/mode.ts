import type { RawKeyInput } from '#tui/environment/raw-key/types';

export type RawKeyInputMode = {
	activate(): void;
	restore(): void;
};

export const createRawKeyInputMode = (input: RawKeyInput): RawKeyInputMode => {
	const wasRaw = Boolean(input.isRaw);

	return {
		activate() {
			if (!input.isTTY) {
				return;
			}

			input.setRawMode?.(true);
			input.resume();
		},
		restore() {
			if (!input.isTTY) {
				return;
			}

			try {
				input.setRawMode?.(wasRaw);
			} finally {
				input.pause();
			}
		},
	};
};
