import { createMemoryOutput, createScriptedInput, withPromptEnvironment } from '@ollin/console';

export const scripted = async <T>(lines: string[], callback: () => Promise<T>): Promise<{ output: string; result: T }> => {
	const output = createMemoryOutput();

	const result = await withPromptEnvironment(
		{
			input: createScriptedInput(lines),
			output,
			error: output,
			interactive: true,
		},
		callback,
	);

	return { output: output.text(), result };
};
