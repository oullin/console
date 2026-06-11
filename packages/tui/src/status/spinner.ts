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
