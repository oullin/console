import { parseWritableOutputStream } from '#tui/environment/validators/stream-output';
import type { PromptOutput } from '#tui/types';

export const outputFromStream = (stream: NodeJS.WritableStream): PromptOutput => {
	const writable = parseWritableOutputStream(stream);

	return {
		write(content: string): void {
			writable.write(content);
		},
	};
};
