import { describe, expect, it } from 'vitest';
import { createMemoryOutput, createScriptedInput, Key, textarea, withPromptEnvironment } from '../src/index';

describe('textarea prompt', () => {
  it('accepts multiline input and submits with ctrl-d', async () => {
    const output = createMemoryOutput();
    const result = await withPromptEnvironment(
      {
        input: createScriptedInput(['A', Key.enter, 'B', Key.ctrlD]),
        output,
        error: output,
        interactive: true
      },
      () => textarea('Description')
    );

    expect(result).toBe('A\nB');
    expect(output.text()).toContain('Description');
  });
});
