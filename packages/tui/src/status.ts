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

  constructor(
    readonly total: number,
    readonly message = 'Progress'
  ) {}

  advance(step = 1): void {
    this.#current = Math.min(this.total, this.#current + step);
    promptEnvironment().output.write(`${this.message}: ${this.#current}/${this.total}\n`);
  }

  finish(): void {
    this.#current = this.total;
    promptEnvironment().output.write(`${this.message}: ${this.total}/${this.total}\n`);
  }

  value(): number {
    return this.#current;
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

  const total = typeof steps === 'number' ? steps : Array.from(steps).length;
  const bar = new Progress(total, labelOrTotal);

  if (!callback) {
    return bar;
  }

  return (async () => {
    const values = typeof steps === 'number' ? Array.from({ length: steps }, (_, index) => index + 1) : Array.from(steps);
    const results: R[] = [];

    for (const value of values) {
      results.push(await callback(value, bar));
      bar.advance();
    }

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
