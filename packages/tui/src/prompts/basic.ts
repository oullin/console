import { promptUntilValid, PromptValidationError } from '#tui/prompt';
import { readTypedValue } from '#tui/typed-value';
import type { NumberPromptOptions, TextPromptOptions } from '#tui/types';

const textOptions = (message: string | TextPromptOptions, fallback = ''): TextPromptOptions => {
  if (typeof message === 'string') {
    return { message, default: fallback };
  }

  return { ...message, default: message.default ?? fallback };
};

export function text(options: TextPromptOptions): Promise<string>;
export function text(
  label: string,
  placeholder?: string,
  defaultValue?: string,
  required?: boolean | string,
  validate?: TextPromptOptions['validate'],
  hint?: string,
  transform?: TextPromptOptions['transform']
): Promise<string>;
export async function text(
  message: string | TextPromptOptions,
  placeholder = '',
  defaultValue = '',
  required: boolean | string = false,
  validate: TextPromptOptions['validate'] = undefined,
  hint = '',
  transform: TextPromptOptions['transform'] = undefined
): Promise<string> {
  const options = typeof message === 'string'
    ? textOptions({ message, label: message, placeholder, default: defaultValue, required, validate, hint, transform })
    : textOptions(message);

  return promptUntilValid(options, async () => {
    const answer = await readTypedValue(options.message, {
      default: options.default,
      hint: options.hint
    });
    const value = answer === '' && options.default !== undefined ? options.default : answer;

    return options.transform ? options.transform(value) : value;
  });
}

export function textarea(options: TextPromptOptions & { rows?: number }): Promise<string>;
export function textarea(
  label: string,
  placeholder?: string,
  defaultValue?: string,
  required?: boolean | string,
  validate?: TextPromptOptions['validate'],
  hint?: string,
  rows?: number,
  transform?: TextPromptOptions['transform']
): Promise<string>;
export async function textarea(
  message: string | (TextPromptOptions & { rows?: number }),
  placeholder = '',
  defaultValue = '',
  required: boolean | string = false,
  validate: TextPromptOptions['validate'] = undefined,
  hint = '',
  _rows = 5,
  transform: TextPromptOptions['transform'] = undefined
): Promise<string> {
  const options = typeof message === 'string'
    ? textOptions({ message, label: message, placeholder, default: defaultValue, required, validate, hint, transform })
    : textOptions(message);

  return promptUntilValid(options, async () => {
    const answer = await readTypedValue(options.message, {
      default: options.default,
      hint: options.hint,
      allowNewLine: true
    });
    const value = answer === '' && options.default !== undefined ? options.default : answer;

    return options.transform ? options.transform(value) : value;
  });
}

export function password(options: TextPromptOptions): Promise<string>;
export function password(
  label: string,
  placeholder?: string,
  required?: boolean | string,
  validate?: TextPromptOptions['validate'],
  hint?: string,
  transform?: TextPromptOptions['transform']
): Promise<string>;
export async function password(
  message: string | TextPromptOptions,
  placeholder = '',
  required: boolean | string = false,
  validate: TextPromptOptions['validate'] = undefined,
  hint = '',
  transform: TextPromptOptions['transform'] = undefined
): Promise<string> {
  const options = typeof message === 'string'
    ? textOptions({ message, label: message, placeholder, required, validate, hint, transform })
    : textOptions(message);

  return text(options);
}

export function number(options: NumberPromptOptions): Promise<number>;
export function number(
  label: string,
  placeholder?: string,
  defaultValue?: number,
  required?: boolean | string,
  validate?: NumberPromptOptions['validate'],
  hint?: string,
  min?: number,
  max?: number,
  step?: number
): Promise<number>;
export async function number(
  message: string | NumberPromptOptions,
  _placeholder = '',
  defaultValue = 0,
  required: boolean | string = false,
  validate: NumberPromptOptions['validate'] = undefined,
  hint = '',
  min: number | undefined = undefined,
  max: number | undefined = undefined,
  step: number | undefined = undefined
): Promise<number> {
  const options: NumberPromptOptions = typeof message === 'string'
    ? { message, label: message, default: defaultValue, required, validate, hint, min, max, step }
    : { ...message, default: message.default ?? defaultValue };

  return promptUntilValid(options, async () => {
    const answer = await readTypedValue(options.message, {
      default: options.default === undefined ? undefined : String(options.default),
      hint: options.hint
    });

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

    return options.transform ? options.transform(parsed) : parsed;
  });
}
