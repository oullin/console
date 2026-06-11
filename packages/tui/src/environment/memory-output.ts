import type { PromptOutput } from '#tui/types';

export type MemoryOutput = PromptOutput & {
	clear(): void;
	text(): string;
};

export const createMemoryOutput = (): MemoryOutput => {
	let buffer = '';

	return {
		clear(): void {
			buffer = '';
		},
		write(content: string): void {
			buffer += content;
		},
		text(): string {
			return buffer;
		},
	};
};
