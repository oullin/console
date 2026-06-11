import { describe, expect, it } from 'vitest';
import { createMemoryOutput, stream, withPromptEnvironment } from '#tui/index';

describe('stream helper', () => {
	it('appends streamed content and returns the accumulated value', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			const outputStream = stream();

			outputStream.append('hello');
			outputStream.write(' world');
			outputStream.close();

			expect(outputStream.value()).toBe('hello world');
			expect(outputStream.lines()).toEqual(['hello world']);
		});

		expect(output.text()).toBe('hello world');
	});

	it('pipes iterable content through a stateful stream', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			await stream(['one', '\n', 'two']);
		});

		expect(output.text()).toBe('one\ntwo');
	});

	it('cannot be prompted for input', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			const outputStream = stream();

			expect(() => outputStream.prompt()).toThrow('Stream cannot be prompted');
		});
	});
});
