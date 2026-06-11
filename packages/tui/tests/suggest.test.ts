import { describe, expect, it } from 'vitest';
import { createMemoryOutput, createScriptedInput, Key, suggest, withPromptEnvironment } from '../src/index';

const runSuggest = async (keys: string[], options: string[] | ((query: string) => string[])): Promise<string> => {
  const output = createMemoryOutput();

  return withPromptEnvironment(
    {
      input: createScriptedInput(keys),
      output,
      error: output,
      interactive: true
    },
    () => suggest('Favorite color?', options)
  );
};

describe('suggest prompt', () => {
  it('accepts arbitrary typed input', async () => {
    await expect(runSuggest(['B', 'l', 'a', 'c', 'k', Key.enter], ['Red', 'Green', 'Blue'])).resolves.toBe('Black');
  });

  it('completes input using tab', async () => {
    await expect(runSuggest(['b', Key.tab, Key.enter], ['Red', 'Green', 'Blue'])).resolves.toBe('Blue');
  });

  it('navigates matches using arrow and emacs keys', async () => {
    await expect(runSuggest(['b', Key.down, Key.down, Key.down, Key.up, Key.enter], ['Red', 'Blue', 'Black', 'Blurple'])).resolves.toBe('Black');
    await expect(runSuggest(['b', Key.ctrlN, Key.ctrlN, Key.ctrlN, Key.ctrlP, Key.enter], ['Red', 'Blue', 'Black', 'Blurple'])).resolves.toBe('Black');
  });

  it('supports callback options', async () => {
    await expect(runSuggest(['e', 'e', Key.down, Key.enter], (value) => ['Red', 'Green', 'Blue'].filter((option) => option.toLowerCase().includes(value.toLowerCase())))).resolves.toBe('Green');
  });
});
