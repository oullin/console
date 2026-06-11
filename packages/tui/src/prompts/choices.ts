import { ask, promptUntilValid, PromptValidationError } from '#tui/prompt';
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

export const confirm = async (message: string | ConfirmPromptOptions): Promise<boolean> => {
  const options: ConfirmPromptOptions = typeof message === 'string' ? { message, default: true } : message;

  return promptUntilValid(options, async () => {
    const suffix = options.default === false ? ' [y/N]' : ' [Y/n]';
    const answer = (await ask(`${options.message}${suffix}`, options.hint)).trim().toLowerCase();

    if (answer === '' && options.default !== undefined) {
      return options.default;
    }

    return ['y', 'yes', options.yes?.toLowerCase()].includes(answer);
  });
};

export const select = async <T>(options: SelectPromptOptions<T>): Promise<T> => {
  const choices = normalizeChoices(options.options);

  return promptUntilValid(options, async () => {
    const rendered = renderChoices(choices);
    const answer = await ask(`${options.message}\n${rendered}\n`, options.hint);
    const choice = findChoice(choices, answer);
    const selected = choice?.value ?? options.default ?? choices.find((candidate) => !candidate.disabled)?.value;

    if (selected === undefined) {
      throw new PromptValidationError('Please select a valid option.');
    }

    return selected;
  });
};

export const multiselect = async <T>(options: MultiSelectPromptOptions<T>): Promise<T[]> => {
  const choices = normalizeChoices(options.options);

  return promptUntilValid(options, async () => {
    const rendered = renderChoices(choices);
    const answer = await ask(`${options.message}\n${rendered}\n`, options.hint);

    if (answer.trim() === '' && options.default !== undefined) {
      return options.default;
    }

    return answer
      .split(',')
      .map((part) => findChoice(choices, part.trim()))
      .filter((choice): choice is Choice<T> => choice !== undefined && !choice.disabled)
      .map((choice) => choice.value);
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
