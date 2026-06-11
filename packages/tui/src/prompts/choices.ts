import { ask, promptUntilValid, PromptValidationError } from '#tui/prompt';
import { promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { renderChoices } from '#tui/theme';
import type {
  Choice,
  ChoiceInput,
  ConfirmPromptOptions,
  MultiSelectPromptOptions,
  SearchPromptOptions,
  SelectPromptOptions,
  TextPromptOptions
} from '#tui/types';

export const normalizeChoices = <T>(options: Array<ChoiceInput<T>>): Array<Choice<T>> => {
  return options.map((choice) => {
    if (typeof choice === 'object' && choice !== null && 'value' in choice && 'label' in choice) {
      return choice;
    }

    return {
      label: String(choice),
      value: choice as T
    };
  });
};

const findChoice = <T>(choices: Array<Choice<T>>, answer: string): Choice<T> | undefined => {
  const index = Number.parseInt(answer, 10);

  if (!Number.isNaN(index)) {
    return choices[index - 1];
  }

  return choices.find((choice) => choice.label === answer || String(choice.value) === answer);
};

const firstEnabledIndex = <T>(choices: Array<Choice<T>>): number => {
  const index = choices.findIndex((choice) => !choice.disabled);

  return index === -1 ? 0 : index;
};

const nextEnabledIndex = <T>(choices: Array<Choice<T>>, current: number, direction: 1 | -1): number => {
  if (choices.length === 0) {
    return 0;
  }

  let index = current;

  for (let attempts = 0; attempts < choices.length; attempts += 1) {
    index = (index + direction + choices.length) % choices.length;

    if (!choices[index]?.disabled) {
      return index;
    }
  }

  return current;
};

const renderInteractiveChoices = <T>(message: string, choices: Array<Choice<T>>, selected: number, marked: Set<number> = new Set()): void => {
  const environment = promptEnvironment();

  environment.output.write(`${message}\n`);

  for (const [index, choice] of choices.entries()) {
    const pointer = index === selected ? '›' : ' ';
    const checked = marked.size > 0 ? (marked.has(index) ? '[x]' : '[ ]') : '  ';
    const disabled = choice.disabled ? ` (${typeof choice.disabled === 'string' ? choice.disabled : 'disabled'})` : '';
    const hint = choice.hint ? ` ${choice.hint}` : '';

    environment.output.write(`${pointer} ${checked} ${choice.label}${hint}${disabled}\n`);
  }
};

const readSelectedChoice = async <T>(message: string, choices: Array<Choice<T>>, hint?: string): Promise<T> => {
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
  renderInteractiveChoices(message, choices, selected);

  while (true) {
    const key = await environment.input.readKey();

    if (key === null) {
      throw new PromptValidationError('Please select a valid option.');
    }

    const numeric = Number.parseInt(key, 10);

    if (!Number.isNaN(numeric) && choices[numeric - 1] && !choices[numeric - 1]?.disabled) {
      return choices[numeric - 1].value;
    }

    if (key === Key.down || key === Key.downArrow || key === Key.ctrlN) {
      selected = nextEnabledIndex(choices, selected, 1);
      renderInteractiveChoices(message, choices, selected);
      continue;
    }

    if (key === Key.up || key === Key.upArrow || key === Key.ctrlP) {
      selected = nextEnabledIndex(choices, selected, -1);
      renderInteractiveChoices(message, choices, selected);
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

const readMultipleChoices = async <T>(message: string, choices: Array<Choice<T>>, defaults: T[] = [], hint?: string): Promise<T[]> => {
  const environment = promptEnvironment();
  const selectedValues = new Set(defaults);

  if (!environment.input.readKey) {
    const rendered = renderChoices(choices);
    const answer = await ask(`${message}\n${rendered}\n`, hint);

    if (answer.trim() === '') {
      return defaults;
    }

    return answer
      .split(',')
      .map((part) => findChoice(choices, part.trim()))
      .filter((choice): choice is Choice<T> => choice !== undefined && !choice.disabled)
      .map((choice) => choice.value);
  }

  let selected = firstEnabledIndex(choices);
  const marked = new Set(choices.flatMap((choice, index) => selectedValues.has(choice.value) ? [index] : []));
  renderInteractiveChoices(message, choices, selected, marked);

  while (true) {
    const key = await environment.input.readKey();

    if (key === null) {
      return [...marked].map((index) => choices[index]?.value).filter((value): value is T => value !== undefined);
    }

    if (key.includes(',')) {
      return key
        .split(',')
        .map((part) => findChoice(choices, part.trim()))
        .filter((choice): choice is Choice<T> => choice !== undefined && !choice.disabled)
        .map((choice) => choice.value);
    }

    const numeric = Number.parseInt(key, 10);

    if (!Number.isNaN(numeric) && choices[numeric - 1] && !choices[numeric - 1]?.disabled) {
      const index = numeric - 1;

      if (marked.has(index)) {
        marked.delete(index);
      } else {
        marked.add(index);
      }

      renderInteractiveChoices(message, choices, selected, marked);
      continue;
    }

    if (key === Key.down || key === Key.downArrow || key === Key.ctrlN) {
      selected = nextEnabledIndex(choices, selected, 1);
      renderInteractiveChoices(message, choices, selected, marked);
      continue;
    }

    if (key === Key.up || key === Key.upArrow || key === Key.ctrlP) {
      selected = nextEnabledIndex(choices, selected, -1);
      renderInteractiveChoices(message, choices, selected, marked);
      continue;
    }

    if (key === Key.space) {
      if (marked.has(selected)) {
        marked.delete(selected);
      } else if (!choices[selected]?.disabled) {
        marked.add(selected);
      }

      renderInteractiveChoices(message, choices, selected, marked);
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
    const selected = await readSelectedChoice(options.message, choices, options.hint).catch((error: unknown) => {
      if (options.default !== undefined && error instanceof PromptValidationError) {
        return options.default;
      }

      throw error;
    });

    return selected;
  });
};

export const multiselect = async <T>(options: MultiSelectPromptOptions<T>): Promise<T[]> => {
  const choices = normalizeChoices(options.options);

  return promptUntilValid(options, async () => {
    return readMultipleChoices(options.message, choices, options.default, options.hint);
  });
};

export const suggest = async (message: string | TextPromptOptions): Promise<string> => {
  const options: TextPromptOptions = typeof message === 'string' ? { message } : message;

  return promptUntilValid(options, async () => {
    const answer = await ask(options.message, options.hint);

    return answer === '' && options.default !== undefined ? options.default : answer;
  });
};

export const search = async <T>(options: SearchPromptOptions<T>): Promise<T> => {
  return promptUntilValid(options, async () => {
    const query = await ask(options.message, options.hint);
    const source = typeof options.options === 'function' ? await options.options(query) : options.options;
    const choices = normalizeChoices(source);
    const choice = findChoice(choices, query) ?? choices.find((candidate) => !candidate.disabled);
    const selected = choice?.value ?? options.default ?? choices[0]?.value;

    if (selected === undefined) {
      throw new PromptValidationError('Please select a valid option.');
    }

    return selected;
  });
};

export const multisearch = async <T>(options: SearchPromptOptions<T[]>): Promise<T[]> => {
  return promptUntilValid(options, async () => {
    const query = await ask(options.message, options.hint);
    const source = typeof options.options === 'function' ? await options.options(query) : options.options;
    const choices = normalizeChoices(source);

    if (query.trim() === '' && options.default !== undefined) {
      return options.default;
    }

    return query
      .split(',')
      .map((part) => findChoice(choices, part.trim()))
      .filter((choice): choice is Choice<T[]> => choice !== undefined && !choice.disabled)
      .flatMap((choice) => choice.value);
  });
};

export const autocomplete = async <T>(options: SearchPromptOptions<T>): Promise<T> => search(options);

export const pause = async (message = 'Press enter to continue'): Promise<void> => {
  await ask(message);
};
