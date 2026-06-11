import { describe, expect, it } from 'vitest';
import {
  confirm,
  createMemoryOutput,
  createScriptedInput,
  form,
  multiselect,
  note,
  error,
  info,
  intro,
  outro,
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

describe('prompt helpers', () => {
  it('reads text and number prompts', async () => {
    await expect(scripted(['Tay', 'lor', '\n'], () => text('Name'))).resolves.toMatchObject({ result: 'Taylor' });
    await expect(scripted(['4', '2', '\n'], () => number({ message: 'Age', integer: true }))).resolves.toMatchObject({ result: 42 });
  });

  it('reads confirm and choice prompts', async () => {
    await expect(scripted(['n'], () => confirm('Continue'))).resolves.toMatchObject({ result: false });

    await expect(
      scripted(['2'], () =>
        select({
          message: 'Framework',
          options: ['Ollin', 'Vue']
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
    const response = await scripted(['A', 'd', 'a', '\n', 'y'], () =>
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
      note('Hello');
      error('Nope');
      info('Facts');
      intro('Start');
      outro('Done');
      table({ headers: ['Name'], rows: [['Ollin']] });
      title('Demo');
    });

    expect(output.text()).toContain('Hello');
    expect(output.text()).toContain('Nope');
    expect(output.text()).toContain('Facts');
    expect(output.text()).toContain('Start');
    expect(output.text()).toContain('Done');
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
    expect(output.text()).toContain('Files:');
    expect(output.text()).toContain('2 / 2');
    expect(output.text()).toContain('ab');
  });
});
