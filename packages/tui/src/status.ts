import { promptEnvironment } from '#tui/environment';
import type { MaybePromise, StatusOptions } from '#tui/types';

export const spin = async <T>(callback: () => MaybePromise<T>, options: StatusOptions = { message: 'Loading' }): Promise<T> => {
  promptEnvironment().output.write(`${options.message}...\n`);

  try {
    const result = await callback();
    promptEnvironment().output.write(`Done: ${options.message}\n`);

    return result;
  } catch (error) {
    promptEnvironment().error.write(`Failed: ${options.message}\n`);
    throw error;
  }
};

export class Progress {
  #current = 0;
  #label: string;
  #hint: string;

  constructor(
    readonly total: number,
    message = 'Progress',
    hint = ''
  ) {
    if (total <= 0) {
      throw new Error('Progress bar must have at least one item.');
    }

    this.#label = message;
    this.#hint = hint;
  }

  start(): void {
    this.render();
  }

  advance(step = 1): void {
    this.#current = Math.min(this.total, this.#current + step);
    this.render();
  }

  finish(): void {
    this.#current = this.total;
    this.render();
  }

  label(value: string): this {
    this.#label = value;

    return this;
  }

  hint(value: string): this {
    this.#hint = value;

    return this;
  }

  percentage(): number {
    return this.#current / this.total;
  }

  value(): number {
    return this.#current;
  }

  render(): void {
    const width = 20;
    const filled = Math.round(width * this.percentage());
    const bar = `${'█'.repeat(filled)}${' '.repeat(width - filled)}`;
    const hint = this.#hint ? ` ${this.#hint}` : '';

    promptEnvironment().output.write(`${this.#label}: ${bar} ${this.#current} / ${this.total}${hint}\n`);
  }
}

export function progress(total: number, message?: string): Progress;
export function progress<T, R>(label: string, steps: Iterable<T> | number, callback?: (step: T | number, progress: Progress) => MaybePromise<R>, hint?: string): Progress | Promise<R[]>;
export function progress<T, R>(
  labelOrTotal: string | number,
  stepsOrMessage?: Iterable<T> | number | string,
  callback?: (step: T | number, progress: Progress) => MaybePromise<R>,
  _hint = ''
): Progress | Promise<R[]> {
  if (typeof labelOrTotal === 'number') {
    return new Progress(labelOrTotal, typeof stepsOrMessage === 'string' ? stepsOrMessage : undefined);
  }

  const steps = stepsOrMessage ?? 0;
  if (typeof steps === 'string') {
    throw new Error('Progress steps must be an iterable or a number.');
  }

  const values = typeof steps === 'number' ? Array.from({ length: steps }, (_, index) => index) : Array.from(steps);
  const bar = new Progress(values.length, labelOrTotal, _hint);

  if (!callback) {
    return bar;
  }

  return (async () => {
    const results: R[] = [];

    bar.start();

    for (const value of values) {
      results.push(await callback(value, bar));
      bar.advance();
    }

    bar.finish();

    return results;
  })();
}

export type TaskDefinition<T> = {
  title: string;
  task: () => MaybePromise<T>;
};

export async function task<T>(definition: TaskDefinition<T>): Promise<T>;
export async function task<T>(label: string, callback: () => MaybePromise<T>, limit?: number, keepSummary?: boolean, subLabel?: string): Promise<T>;
export async function task<T>(
  definitionOrLabel: TaskDefinition<T> | string,
  callback?: () => MaybePromise<T>,
  _limit = 10,
  _keepSummary = false,
  subLabel?: string
): Promise<T> {
  const title = typeof definitionOrLabel === 'string' ? definitionOrLabel : definitionOrLabel.title;
  const run = typeof definitionOrLabel === 'string' ? callback : definitionOrLabel.task;

  if (!run) {
    throw new Error('A task callback is required.');
  }

  promptEnvironment().output.write(`${title}${subLabel ? ` ${subLabel}` : ''}\n`);
  const result = await run();
  promptEnvironment().output.write(`Done: ${title}\n`);

  return result;
}

export class Stream {
  write(content: string): this {
    promptEnvironment().output.write(content);

    return this;
  }

  async pipe(source: AsyncIterable<string> | Iterable<string>): Promise<void> {
    for await (const chunk of source) {
      this.write(chunk);
    }
  }
}

export function stream(): Stream;
export function stream(source: AsyncIterable<string> | Iterable<string>): Promise<void>;
export function stream(source?: AsyncIterable<string> | Iterable<string>): Stream | Promise<void> {
  const output = new Stream();

  return source === undefined ? output : output.pipe(source);
}
