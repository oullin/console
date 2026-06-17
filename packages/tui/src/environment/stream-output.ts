import { parsePromptOutputContent } from '#tui/environment/validators/output';
import { parseWritableOutputStream } from '#tui/environment/validators/stream-output';
import type { PromptOutput } from '#tui/types';

export const outputFromStream = (stream: NodeJS.WritableStream): PromptOutput => {
	const writable = parseWritableOutputStream(stream);
	const write = writable.write.bind(writable);

	return {
		write(content: string): void {
			write(parsePromptOutputContent(content));
		},
	};
};
