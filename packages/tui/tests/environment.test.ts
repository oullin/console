import { describe, expect, it } from 'vitest';
import { configurePrompts, createMemoryOutput, createScriptedInput, promptEnvironment, withPromptEnvironment } from '#tui/environment';

describe('prompt environment', () => {
	it('restores the previous environment when a scoped callback fails', async () => {
		const output = createMemoryOutput();
		const error = createMemoryOutput();
		const previous = promptEnvironment();

		configurePrompts({ output, error, interactive: false });

		const scopedOutput = createMemoryOutput();

		await expect(
			withPromptEnvironment({ output: scopedOutput, interactive: true }, async () => {
				expect(promptEnvironment().output).toBe(scopedOutput);
				expect(promptEnvironment().error).toBe(error);
				expect(promptEnvironment().interactive).toBe(true);

				throw new Error('failed');
			}),
		).rejects.toThrow('failed');

		expect(promptEnvironment().output).toBe(output);
		expect(promptEnvironment().error).toBe(error);
		expect(promptEnvironment().interactive).toBe(false);

		configurePrompts(previous);
	});

	it('merges partial prompt configuration without replacing unspecified concerns', () => {
		const previous = promptEnvironment();
		const output = createMemoryOutput();
		const error = createMemoryOutput();

		configurePrompts({ output, error, interactive: false });

		const nextOutput = createMemoryOutput();

		configurePrompts({ output: nextOutput });

		expect(promptEnvironment().output).toBe(nextOutput);
		expect(promptEnvironment().error).toBe(error);
		expect(promptEnvironment().interactive).toBe(false);

		configurePrompts(previous);
	});

	it('captures and clears memory output', () => {
		const output = createMemoryOutput();

		output.write('first');
		output.write(' second');

		expect(output.text()).toBe('first second');

		output.clear();

		expect(output.text()).toBe('');
	});

	it('drains scripted input independently for key and line reads', async () => {
		const input = createScriptedInput(['a', 'line']);

		await expect(input.readKey?.()).resolves.toBe('a');

		await expect(input.readLine?.('Question')).resolves.toBe('line');

		await expect(input.readKey?.()).resolves.toBeNull();

		await expect(input.readLine?.('Question')).resolves.toBe('');
	});
});
