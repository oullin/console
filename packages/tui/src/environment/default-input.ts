import { stdin as defaultStdin, stdout as defaultStdout } from 'node:process';
import { createInterface } from 'node:readline/promises';
import { readRawKey } from '#tui/environment/raw-key';
import type { PromptInput } from '#tui/types';

export const defaultInput: PromptInput = {
	async readKey(): Promise<string | null> {
		return readRawKey(defaultStdin);
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
