import { describe, expect, it } from 'vitest';
import {
  confirm,
  createMemoryOutput,
  createScriptedInput,
  form,
  multiselect,
  note,
  number,
  progress,
  select,
  spin,
  stream,
  table,
  text,
  title,
  withPromptEnvironment
} from '@ollin/tui';

const scripted = async <T>(lines: string[], callback: () => Promise<T>): Promise<{ output: string; result: T }> => {
  const output = createMemoryOutput();
  const result = await withPromptEnvironment(
    {
      input: createScriptedInput(lines),
      output,
      error: output,
      interactive: true
    },
    callback
  );

  return { output: output.text(), result };
};

describe('Laravel-style helpers', () => {
  it('reads text and number prompts', async () => {
    await expect(scripted(['Taylor'], () => text('Name'))).resolves.toMatchObject({ result: 'Taylor' });
    await expect(scripted(['42'], () => number({ message: 'Age', integer: true }))).resolves.toMatchObject({ result: 42 });
  });

  it('reads confirm and choice prompts', async () => {
    await expect(scripted(['n'], () => confirm('Continue'))).resolves.toMatchObject({ result: false });

    await expect(
      scripted(['2'], () =>
        select({
          message: 'Framework',
          options: ['Laravel', 'Vue']
        })
      )
    ).resolves.toMatchObject({ result: 'Vue' });

    await expect(
      scripted(['1,2'], () =>
        multiselect({
          message: 'Tools',
          options: ['Prompts', 'OpenTUI']
        })
      )
    ).resolves.toMatchObject({ result: ['Prompts', 'OpenTUI'] });
  });

  it('runs form builders', async () => {
    const response = await scripted(['Ada', 'y'], () =>
      form(async (builder) => ({
        name: await builder.text('Name'),
        active: await builder.confirm('Active')
      }))
    );

    expect(response.result).toEqual({ name: 'Ada', active: true });
  });

  it('writes output helpers', async () => {
    const output = createMemoryOutput();

    await withPromptEnvironment({ output, error: output }, async () => {
      note('Hello', 'Greeting');
      table({ headers: ['Name'], rows: [['Laravel']] });
      title('Demo');
    });

    expect(output.text()).toContain('Greeting');
    expect(output.text()).toContain('| Name');
    expect(output.text()).toContain('\u001B]0;Demo\u0007');
  });

  it('runs status helpers', async () => {
    const output = createMemoryOutput();

    await withPromptEnvironment({ output, error: output }, async () => {
      await spin(async () => 'done', { message: 'Working' });
      const bar = progress(2, 'Files');
      bar.advance();
      bar.finish();
      await stream(['a', 'b']);
    });

    expect(output.text()).toContain('Working');
    expect(output.text()).toContain('Files: 2/2');
    expect(output.text()).toContain('ab');
  });
});
