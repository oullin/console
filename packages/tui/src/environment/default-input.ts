import { stdin as defaultStdin, stdout as defaultStdout } from 'node:process';
import { createInterface } from 'node:readline/promises';
import type { PromptInput } from '#tui/types';

export const defaultInput: PromptInput = {
	async readKey(): Promise<string | null> {
		return new Promise((resolve) => {
			const input = defaultStdin;
			const wasRaw = input.isRaw;

			const cleanup = (): void => {
				input.off('data', onData);

				if (input.isTTY) {
					input.setRawMode(wasRaw);
					input.pause();
				}
			};

			const onData = (chunk: Buffer): void => {
				cleanup();
				resolve(chunk.toString('utf8'));
			};

			input.once('data', onData);

			if (input.isTTY) {
				input.setRawMode(true);
				input.resume();
			}
		});
	},
	async readLine(message: string): Promise<string> {
		const readline = createInterface({
			input: defaultStdin,
			output: defaultStdout,
		});

		try {
			return await readline.question(message);
		} finally {
			readline.close();
		}
	},
};
