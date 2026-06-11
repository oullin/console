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
    expect(output.text()).toContain('Favorite color? ue');
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

  it('renders the typed query while navigating results', async () => {
    const output = createMemoryOutput();
    await withPromptEnvironment(
      {
        input: createScriptedInput(['r', Key.down, Key.enter]),
        output,
        error: output,
        interactive: true
      },
      () => search({ message: 'Favorite color?', options: colors })
    );

    expect(output.text()).toContain('Favorite color? r');
    expect(output.text()).toContain('›');
  });

  it('respects scroll windows when rendering results', async () => {
    const output = createMemoryOutput();
    const result = await withPromptEnvironment(
      {
        input: createScriptedInput([Key.down, Key.down, Key.down, Key.enter]),
        output,
        error: output,
        interactive: true
      },
      () =>
        search({
          message: 'Pick number',
          options: ['one', 'two', 'three', 'four'],
          scroll: 3
        })
    );
    const latestFrame = output.text().split('Pick number\n').at(-1) ?? '';

    expect(result).toBe('three');
    expect(latestFrame).not.toContain('one');
    expect(latestFrame).toContain('two');
    expect(latestFrame).toContain('three');
    expect(latestFrame).toContain('four');
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
    expect(output.text()).toContain('Selected: Violet');
    expect(output.text()).toContain('Selected: Violet, Green');
  });
});
