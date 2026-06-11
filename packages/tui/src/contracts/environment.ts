export type PromptOutput = {
	write(content: string): void;
};

export type PromptInput = {
	readKey?(): Promise<string | null>;
	readLine?(message: string): Promise<string>;
};

export type PromptEnvironment = {
	input: PromptInput;
	output: PromptOutput;
	error: PromptOutput;
	interactive: boolean;
};
