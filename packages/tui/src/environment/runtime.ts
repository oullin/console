import { stderr as defaultStderr, stdin as defaultStdin, stdout as defaultStdout } from 'node:process';
import { defaultInput } from '#tui/environment/default-input';
import { outputFromStream } from '#tui/environment/stream-output';
import type { PromptEnvironment } from '#tui/types';

export const defaultEnvironment: PromptEnvironment = {
	input: defaultInput,
	output: outputFromStream(defaultStdout),
	error: outputFromStream(defaultStderr),
	interactive: Boolean(defaultStdin.isTTY),
};
