import { promptEnvironment } from '#tui/environment';
import { Key, oneOf } from '#tui/key';
import { ask, promptUntilValid, PromptValidationError } from '#tui/prompt';
import { renderChoices } from '#tui/theme';
import { findChoice, firstEnabledIndex, nextEnabledIndex, normalizeChoices, renderInteractiveChoices } from '#tui/concerns/choices';
import type { Choice, ConfirmPromptOptions, MultiSelectPromptOptions, SelectPromptOptions } from '#tui/types';

const parseChoiceIndex = (key: string): number => (/^\d+$/u.test(key) ? Number.parseInt(key, 10) : Number.NaN);

const previousChoiceKeys = (key: string): boolean => {
  return key === Key.up
    || key === Key.upArrow
    || key === Key.left
    || key === Key.leftArrow
    || key === Key.shiftTab
    || key === Key.ctrlP
    || key === Key.ctrlB
    || key === 'k'
    || key === 'h';
};

const nextChoiceKeys = (key: string): boolean => {
  return key === Key.down
    || key === Key.downArrow
    || key === Key.right
    || key === Key.rightArrow
    || key === Key.tab
    || key === Key.ctrlN
    || key === Key.ctrlF
    || key === 'j'
    || key === 'l';
};

const readSelectedChoice = async <T>(message: string, choices: Array<Choice<T>>, hint?: string, scroll?: number): Promise<T> => {
  const environment = promptEnvironment();

  if (!environment.input.readKey) {
    const rendered = renderChoices(choices);
    const answer = await ask(`${message}\n${rendered}\n`, hint);
    const choice = findChoice(choices, answer);

    if (!choice || choice.disabled) {
      throw new PromptValidationError('Please select a valid option.');
    }

    return choice.value;
  }

  let selected = firstEnabledIndex(choices);
  renderInteractiveChoices(message, choices, selected, new Set(), scroll);

  while (true) {
    const key = await environment.input.readKey();

    if (key === null) {
      throw new PromptValidationError('Please select a valid option.');
    }

    const numeric = parseChoiceIndex(key);

    if (!Number.isNaN(numeric) && choices[numeric - 1] && !choices[numeric - 1]?.disabled) {
      return choices[numeric - 1].value;
    }

    if (nextChoiceKeys(key)) {
      selected = nextEnabledIndex(choices, selected, 1);
      renderInteractiveChoices(message, choices, selected, new Set(), scroll);
      continue;
    }

    if (previousChoiceKeys(key)) {
      selected = nextEnabledIndex(choices, selected, -1);
      renderInteractiveChoices(message, choices, selected, new Set(), scroll);
      continue;
    }

    if (oneOf([Key.home, Key.ctrlA], key)) {
      selected = firstEnabledIndex(choices);
      renderInteractiveChoices(message, choices, selected, new Set(), scroll);
      continue;
    }

    if (oneOf([Key.end, Key.ctrlE], key)) {
      selected = choices.length - 1;

      while (choices[selected]?.disabled && selected > 0) {
        selected -= 1;
      }

      renderInteractiveChoices(message, choices, selected, new Set(), scroll);
      continue;
    }

    if (key === Key.enter) {
      const choice = choices[selected];

      if (!choice || choice.disabled) {
        throw new PromptValidationError('Please select a valid option.');
      }

      return choice.value;
    }
  }
};

const choicesFromCommaSeparated = <T>(choices: Array<Choice<T>>, answer: string): T[] => {
  const parts = answer.split(',').map((part) => part.trim()).filter((part) => part.length > 0);
  const selected = parts
    .map((part) => findChoice(choices, part))
    .filter((choice): choice is Choice<T> => choice !== undefined && !choice.disabled);

  if (selected.length !== parts.length) {
    throw new PromptValidationError('Please select valid options.');
  }

  return selected.map((choice) => choice.value);
};

const renderMultipleChoices = <T>(message: string, choices: Array<Choice<T>>, selected: number, marked: Set<number>, scroll?: number): void => {
  renderInteractiveChoices(message, choices, selected, marked, scroll);

  const labels = [...marked]
    .sort((left, right) => left - right)
    .map((index) => choices[index]?.label)
    .filter((label): label is string => label !== undefined);

  if (labels.length > 0) {
    promptEnvironment().output.write(`Selected: ${labels.join(', ')}\n`);
  }
};

const readMultipleChoices = async <T>(message: string, choices: Array<Choice<T>>, defaults: T[] = [], hint?: string, scroll?: number): Promise<T[]> => {
  const environment = promptEnvironment();
  const selectedValues = new Set(defaults);

  if (!environment.input.readKey) {
    const rendered = renderChoices(choices);
    const answer = await ask(`${message}\n${rendered}\n`, hint);

    return answer.trim() === '' ? defaults : choicesFromCommaSeparated(choices, answer);
  }

  let selected = firstEnabledIndex(choices);
  const marked = new Set(choices.flatMap((choice, index) => selectedValues.has(choice.value) ? [index] : []));
  renderMultipleChoices(message, choices, selected, marked, scroll);

  while (true) {
    const key = await environment.input.readKey();

    if (key === null) {
      return [...marked].map((index) => choices[index]?.value).filter((value): value is T => value !== undefined);
    }

    if (key.includes(',')) {
      return choicesFromCommaSeparated(choices, key);
    }

    const numeric = parseChoiceIndex(key);

    if (!Number.isNaN(numeric) && choices[numeric - 1] && !choices[numeric - 1]?.disabled) {
      const index = numeric - 1;

      if (marked.has(index)) {
        marked.delete(index);
      } else {
        marked.add(index);
      }

      renderMultipleChoices(message, choices, selected, marked, scroll);
      continue;
    }

    if (nextChoiceKeys(key)) {
      selected = nextEnabledIndex(choices, selected, 1);
      renderMultipleChoices(message, choices, selected, marked, scroll);
      continue;
    }

    if (previousChoiceKeys(key)) {
      selected = nextEnabledIndex(choices, selected, -1);
      renderMultipleChoices(message, choices, selected, marked, scroll);
      continue;
    }

    if (oneOf([Key.home], key)) {
      selected = firstEnabledIndex(choices);
      renderMultipleChoices(message, choices, selected, marked, scroll);
      continue;
    }

    if (oneOf([Key.end], key)) {
      selected = choices.length - 1;

      while (choices[selected]?.disabled && selected > 0) {
        selected -= 1;
      }

      renderMultipleChoices(message, choices, selected, marked, scroll);
      continue;
    }

    if (key === Key.ctrlA) {
      if (marked.size === choices.filter((choice) => !choice.disabled).length) {
        marked.clear();
      } else {
        marked.clear();

        for (const [index, choice] of choices.entries()) {
          if (!choice.disabled) {
            marked.add(index);
          }
        }
      }

      renderMultipleChoices(message, choices, selected, marked, scroll);
      continue;
    }

    if (key === Key.space) {
      if (marked.has(selected)) {
        marked.delete(selected);
      } else if (!choices[selected]?.disabled) {
        marked.add(selected);
      }

      renderMultipleChoices(message, choices, selected, marked, scroll);
      continue;
    }

    if (key === Key.enter) {
      return [...marked].map((index) => choices[index]?.value).filter((value): value is T => value !== undefined);
    }
  }
};

export function confirm(options: ConfirmPromptOptions): Promise<boolean>;
export function confirm(
  label: string,
  defaultValue?: boolean,
  yes?: string,
  no?: string,
  required?: boolean | string,
  validate?: ConfirmPromptOptions['validate'],
  hint?: string
): Promise<boolean>;
export async function confirm(
  message: string | ConfirmPromptOptions,
  defaultValue = true,
  yes = 'Yes',
  no = 'No',
  required: boolean | string = false,
  validate: ConfirmPromptOptions['validate'] = undefined,
  hint = ''
): Promise<boolean> {
  const options: ConfirmPromptOptions = typeof message === 'string'
    ? { message, label: message, default: defaultValue, yes, no, required, validate, hint }
    : { ...message, default: message.default ?? true };

  return promptUntilValid(options, async () => {
    const suffix = options.default === false ? ' [y/N]' : ' [Y/n]';
    const answer = (await ask(`${options.message}${suffix}`, options.hint)).trim().toLowerCase();

    if (answer === '' && options.default !== undefined) {
      return options.default;
    }

    return ['y', 'yes', options.yes?.toLowerCase()].includes(answer);
  });
}

export const select = async <T>(options: SelectPromptOptions<T>): Promise<T> => {
  const choices = normalizeChoices(options.options);

  return promptUntilValid(options, async () => {
    return readSelectedChoice(options.message, choices, options.hint, options.scroll).catch((error: unknown) => {
      if (options.default !== undefined && error instanceof PromptValidationError) {
        return options.default;
      }

      throw error;
    });
  });
};

export const multiselect = async <T>(options: MultiSelectPromptOptions<T>): Promise<T[]> => {
  const choices = normalizeChoices(options.options);

  return promptUntilValid(options, async () => readMultipleChoices(options.message, choices, options.default, options.hint, options.scroll));
};
