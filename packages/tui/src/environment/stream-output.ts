import type { PromptOutput } from '#tui/types';

export const outputFromStream = (stream: NodeJS.WritableStream): PromptOutput => ({
	write(content: string): void {
		stream.write(content);
	},
});
