import { promptUntilValid, PromptValidationError } from '#tui/prompt';
import { readTypedValue } from '#tui/typed-value';
import type { NumberPromptOptions } from '#tui/types';

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
