import { Key, createMemoryOutput, createScriptedInput, text, withPromptEnvironment } from '@ollin/tui';

export async function testingExample(): Promise<string> {
	const output = createMemoryOutput();
	const input = createScriptedInput(['Ada', Key.enter]);

	const name = await withPromptEnvironment({ input, output }, () =>
		text({
			message: 'Name',
			required: true,
		}),
	);

	return output.text() + name;
}
