import { describe, expect, it } from 'vitest';
import { clear, clearTerminal, createMemoryOutput, cursorToStart, eraseLine, setTerminalTitle, title, withPromptEnvironment } from '#tui/index';

describe('terminal helpers', () => {
	it('writes clear terminal control sequences', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			clearTerminal();
			clear();
		});

		expect(output.text()).toBe('\u001Bc\u001Bc');
	});

	it('writes terminal title control sequences', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			setTerminalTitle('Demo');
			title('Prompt');
		});

		expect(output.text()).toBe('\u001B]0;Demo\u0007\u001B]0;Prompt\u0007');
	});

	it('writes cursor and erase-line control sequences', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			cursorToStart();
			eraseLine();
		});

		expect(output.text()).toBe('\r\u001B[2K');
	});
});
