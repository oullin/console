import { describe, expect, it } from 'vitest';
import { createMemoryOutput, createScriptedInput, Key, multiselect, select, withPromptEnvironment } from '../src/index';

describe('choice prompts', () => {
  it('selects with arrow keys and enter', async () => {
    const output = createMemoryOutput();
    const result = await withPromptEnvironment(
      {
        input: createScriptedInput([Key.down, Key.enter]),
        output,
        error: output,
        interactive: true
      },
      () => select({ message: 'Pick one', options: ['first', 'second'] })
    );

    expect(result).toBe('second');
    expect(output.text()).toContain('Pick one');
  });

  it('toggles multiselect choices with the space bar', async () => {
    const output = createMemoryOutput();
    const result = await withPromptEnvironment(
      {
        input: createScriptedInput([Key.space, Key.down, Key.space, Key.enter]),
        output,
        error: output,
        interactive: true
      },
      () => multiselect({ message: 'Pick many', options: ['first', 'second'] })
    );

    expect(result).toEqual(['first', 'second']);
  });
});
