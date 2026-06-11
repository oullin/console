import { describe, expect, it } from 'vitest';
import { createMemoryOutput, createScriptedInput, Key, multisearch, search, withPromptEnvironment } from '../src/index';

const colors = (value: string): Record<string, string> => {
  const options = {
    red: 'Red',
    green: 'Green',
    blue: 'Blue'
  };

  return Object.fromEntries(Object.entries(options).filter(([, label]) => label.toLowerCase().includes(value.toLowerCase())));
};

describe('search prompt', () => {
  it('returns keys from associative options', async () => {
    const output = createMemoryOutput();
    const result = await withPromptEnvironment(
      {
        input: createScriptedInput(['u', 'e', Key.down, Key.enter]),
        output,
        error: output,
        interactive: true
      },
      () => search({ message: 'Favorite color?', options: colors })
    );

    expect(result).toBe('blue');
  });

  it('validates selected values and allows another selection', async () => {
    const output = createMemoryOutput();
    const result = await withPromptEnvironment(
      {
        input: createScriptedInput([Key.down, Key.enter, Key.down, Key.enter]),
        output,
        error: output,
        interactive: true
      },
      () =>
        search({
          message: 'Favorite color?',
          options: () => ({ red: 'Red', green: 'Green', blue: 'Blue' }),
          validate: (value) => (value === 'red' ? 'Please choose green.' : null)
        })
    );

    expect(result).toBe('green');
    expect(output.text()).toContain('Please choose green.');
  });
});

describe('multisearch prompt', () => {
  it('toggles highlighted search results', async () => {
    const output = createMemoryOutput();
    const result = await withPromptEnvironment(
      {
        input: createScriptedInput(['V', Key.down, Key.space, Key.backspace, 'G', 'r', Key.down, Key.space, Key.enter]),
        output,
        error: output,
        interactive: true
      },
      () =>
        multisearch({
          message: 'Favorite colors?',
          options: (value) => {
            const options = { green: 'Green', violet: 'Violet' };

            return Object.fromEntries(Object.entries(options).filter(([, label]) => label.toLowerCase().includes(value.toLowerCase())));
          }
        })
    );

    expect(result).toEqual(['violet', 'green']);
  });
});
