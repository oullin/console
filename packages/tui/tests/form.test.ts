import { describe, expect, it } from 'vitest';
import { createMemoryOutput, createScriptedInput, form, Key, withPromptEnvironment } from '../src/index';

describe('form builder', () => {
  it('runs chained steps and returns positional responses', async () => {
    const output = createMemoryOutput();
    const responses = await withPromptEnvironment(
      {
        input: createScriptedInput(['A', 'd', 'a', Key.enter, Key.enter, Key.enter]),
        output,
        error: output,
        interactive: true
      },
      () =>
        form()
          .text('Name')
          .select('Runtime', ['TS', 'JS'])
          .confirm('Active')
          .submit()
    );

    expect(responses[0]).toBe('Ada');
    expect(responses[1]).toBe('TS');
    expect(responses[2]).toBe(true);
  });

  it('keys named responses and passes prior responses to custom steps', async () => {
    const output = createMemoryOutput();
    const responses = await withPromptEnvironment(
      {
        input: createScriptedInput(['A', 'd', 'a', Key.enter]),
        output,
        error: output,
        interactive: true
      },
      () =>
        form()
          .text('Name', '', '', false, undefined, '', 'name')
          .add((values) => `Hello ${values.name}`, 'greeting')
          .submit()
    );

    expect(responses.name).toBe('Ada');
    expect(responses.greeting).toBe('Hello Ada');
  });

  it('stores null for skipped conditional steps', async () => {
    const responses = await withPromptEnvironment(
      {
        input: createScriptedInput(['n']),
        output: createMemoryOutput(),
        error: createMemoryOutput(),
        interactive: true
      },
      () =>
        form()
          .confirm('Include details?', false, 'Yes', 'No', false, undefined, '', 'include')
          .addIf((values) => values.include === true, () => 'details', 'details')
          .submit()
    );

    expect(responses.include).toBe(false);
    expect(responses.details).toBeNull();
  });
});
