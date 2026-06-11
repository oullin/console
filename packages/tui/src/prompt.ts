import { promptEnvironment } from '#tui/environment';
import { renderError, renderQuestion } from '#tui/theme';
import type { BasePromptOptions, Validator } from '#tui/types';

export class PromptValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PromptValidationError';
  }
}

export const validationMessage = async <T>(value: T, validator?: Validator<T>): Promise<string | undefined> => {
  const result = await validator?.(value);

  if (typeof result === 'string') {
    return result;
  }

  if (result === false) {
    return 'The given value is invalid.';
  }

  return undefined;
};

export const ensureRequired = <T>(value: T, required?: boolean | string): string | undefined => {
  const empty = value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);

  if (!empty || !required) {
    return undefined;
  }

  return typeof required === 'string' ? required : 'A value is required.';
};

export const promptUntilValid = async <T>(
  options: BasePromptOptions<T>,
  read: () => Promise<T>
): Promise<T> => {
  const environment = promptEnvironment();

  if (!environment.interactive && options.default !== undefined) {
    return options.default;
  }

  while (true) {
    const value = await read();
    const required = ensureRequired(value, options.required);
    const validation = required ?? (await validationMessage(value, options.validate));

    if (!validation) {
      return value;
    }

    if (!environment.interactive) {
      throw new PromptValidationError(validation);
    }

    environment.error.write(renderError(validation));
  }
};

export const ask = async (message: string, hint?: string): Promise<string> => {
  const environment = promptEnvironment();

  return environment.input.readLine(renderQuestion(message, hint));
};
