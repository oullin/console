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

export const progress = (total: number, message?: string): Progress => new Progress(total, message);

export type TaskDefinition<T> = {
  title: string;
  task: () => MaybePromise<T>;
};

export const task = async <T>(definition: TaskDefinition<T>): Promise<T> => {
  promptEnvironment().output.write(`${definition.title}\n`);
  const result = await definition.task();
  promptEnvironment().output.write(`Done: ${definition.title}\n`);

  return result;
};

export const stream = async (source: AsyncIterable<string> | Iterable<string>): Promise<void> => {
  for await (const chunk of source) {
    promptEnvironment().output.write(chunk);
  }
};
