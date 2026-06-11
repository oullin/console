import { ask, promptUntilValid, PromptValidationError } from '#tui/prompt';
import type { NumberPromptOptions, TextPromptOptions } from '#tui/types';

const textOptions = (message: string | TextPromptOptions, fallback = ''): TextPromptOptions => {
  if (typeof message === 'string') {
    return { message, default: fallback };
  }

  return message;
};

export const text = async (message: string | TextPromptOptions): Promise<string> => {
  const options = textOptions(message);

  return promptUntilValid(options, async () => {
    const answer = await ask(options.message, options.hint);

    return answer === '' && options.default !== undefined ? options.default : answer;
  });
};

export const textarea = async (message: string | TextPromptOptions): Promise<string> => {
  return text(textOptions(message));
};

export const password = async (message: string | TextPromptOptions): Promise<string> => {
  return text(textOptions(message));
};

export const number = async (message: string | NumberPromptOptions): Promise<number> => {
  const options: NumberPromptOptions = typeof message === 'string' ? { message } : message;

  return promptUntilValid(options, async () => {
    const answer = await ask(options.message, options.hint);

    if (answer === '' && options.default !== undefined) {
      return options.default;
    }

    const parsed = options.integer ? Number.parseInt(answer, 10) : Number.parseFloat(answer);

    if (Number.isNaN(parsed)) {
      throw new PromptValidationError('Please enter a valid number.');
    }

    if (options.min !== undefined && parsed < options.min) {
      throw new PromptValidationError(`Please enter a value greater than or equal to ${options.min}.`);
    }

    if (options.max !== undefined && parsed > options.max) {
      throw new PromptValidationError(`Please enter a value less than or equal to ${options.max}.`);
    }

    return parsed;
  });
};
