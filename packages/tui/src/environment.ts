import { createInterface } from 'node:readline/promises';
import { stdin as defaultStdin, stdout as defaultStdout, stderr as defaultStderr } from 'node:process';
import type { PromptEnvironment, PromptInput, PromptOutput } from '#tui/types';

const outputFromStream = (stream: NodeJS.WritableStream): PromptOutput => ({
  write(content: string): void {
    stream.write(content);
  }
});

const defaultInput: PromptInput = {
  async readLine(message: string): Promise<string> {
    const readline = createInterface({
      input: defaultStdin,
      output: defaultStdout
    });

    try {
      return await readline.question(message);
    } finally {
      readline.close();
    }
  }
};

let currentEnvironment: PromptEnvironment = {
  input: defaultInput,
  output: outputFromStream(defaultStdout),
  error: outputFromStream(defaultStderr),
  interactive: Boolean(defaultStdin.isTTY)
};

export const promptEnvironment = (): PromptEnvironment => currentEnvironment;

export const configurePrompts = (environment: Partial<PromptEnvironment>): void => {
  currentEnvironment = {
    ...currentEnvironment,
    ...environment
  };
};

export const withPromptEnvironment = async <T>(
  environment: Partial<PromptEnvironment>,
  callback: () => Promise<T>
): Promise<T> => {
  const previous = currentEnvironment;
  configurePrompts(environment);

  try {
    return await callback();
  } finally {
    currentEnvironment = previous;
  }
};

export const createMemoryOutput = (): PromptOutput & { text(): string } => {
  let buffer = '';

  return {
    write(content: string): void {
      buffer += content;
    },
    text(): string {
      return buffer;
    }
  };
};

export const createScriptedInput = (lines: string[]): PromptInput => {
  const queued = [...lines];

  return {
    async readLine(): Promise<string> {
      return queued.shift() ?? '';
    }
  };
};
