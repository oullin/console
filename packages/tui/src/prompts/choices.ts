import { ask, promptUntilValid, PromptValidationError } from '#tui/prompt';
import { promptEnvironment } from '#tui/environment';
import { Key, oneOf } from '#tui/key';
import { renderChoices } from '#tui/theme';
import { applyTypedKey } from '#tui/typed-value';
import { findChoice, firstEnabledIndex, nextEnabledIndex, normalizeChoices, normalizeSearchChoices, renderInteractiveChoices } from '#tui/concerns/choices';
import type {
  Choice,
  ConfirmPromptOptions,
  MaybePromise,
  MultiSearchPromptOptions,
  MultiSelectPromptOptions,
  SearchPromptOptions,
  SelectPromptOptions,
  TextPromptOptions
} from '#tui/types';

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

    const numeric = /^\d+$/u.test(key) ? Number.parseInt(key, 10) : Number.NaN;

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
      const selectedChoices = key
        .split(',')
        .map((part) => findChoice(choices, part.trim()))
        .filter((choice): choice is Choice<T> => choice !== undefined && !choice.disabled);

      if (selectedChoices.length !== key.split(',').length) {
        throw new PromptValidationError('Please select valid options.');
      }

      return selectedChoices.map((choice) => choice.value);
    }

    const numeric = /^\d+$/u.test(key) ? Number.parseInt(key, 10) : Number.NaN;

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

type SuggestOptions = TextPromptOptions & {
  options: string[] | ((query: string) => MaybePromise<string[]>);
  scroll?: number;
  info?: string | ((value: string) => string);
};

const suggestOptions = (
  message: string | SuggestOptions,
  options: string[] | ((query: string) => MaybePromise<string[]>) = [],
  placeholder = '',
  defaultValue = '',
  scroll = 5,
  required: boolean | string = false,
  validate: TextPromptOptions['validate'] = undefined,
  hint = '',
  transform: TextPromptOptions['transform'] = undefined
): SuggestOptions => {
  if (typeof message === 'string') {
    return { message, label: message, options, placeholder, default: defaultValue, scroll, required, validate, hint, transform };
  }

  return { ...message, default: message.default ?? '' };
};

const resolveSuggestions = async (source: SuggestOptions['options'], query: string): Promise<string[]> => {
  const options = typeof source === 'function' ? await source(query) : source;

  if (typeof source === 'function') {
    return [...options];
  }

  return options.filter((option: string) => option.toLowerCase().startsWith(query.toLowerCase()));
};

const readSuggestionValue = async (options: SuggestOptions): Promise<string> => {
  const environment = promptEnvironment();

  if (!environment.input.readKey) {
    return ask(options.message, options.hint);
  }

  let state = {
    cursor: options.default?.length ?? 0,
    value: options.default ?? ''
  };
  let highlighted: number | null = null;
  let matches: string[] = await resolveSuggestions(options.options, state.value);

  environment.output.write(`${options.message}\n`);

  while (true) {
    const key = await environment.input.readKey();

    if (key === null) {
      return state.value;
    }

    if (key === Key.tab) {
      matches = await resolveSuggestions(options.options, state.value);
      const match = matches[highlighted ?? 0];

      if (match !== undefined) {
        state = { cursor: match.length, value: match };
      }

      continue;
    }

    if (key === Key.down || key === Key.downArrow || key === Key.ctrlN || key === Key.shiftTab) {
      matches = await resolveSuggestions(options.options, state.value);
      highlighted = matches.length === 0 ? null : ((highlighted ?? -1) + 1) % matches.length;
      continue;
    }

    if (key === Key.up || key === Key.upArrow || key === Key.ctrlP) {
      matches = await resolveSuggestions(options.options, state.value);
      highlighted = matches.length === 0 ? null : ((highlighted ?? matches.length) - 1 + matches.length) % matches.length;
      continue;
    }

    if (oneOf([Key.home, Key.ctrlA], key) && highlighted !== null) {
      highlighted = 0;
      continue;
    }

    if (oneOf([Key.end, Key.ctrlE], key) && highlighted !== null) {
      highlighted = Math.max(0, matches.length - 1);
      continue;
    }

    if (key === Key.enter) {
      if (highlighted !== null && matches[highlighted] !== undefined) {
        return matches[highlighted];
      }

      return state.value;
    }

    const next = applyTypedKey(state, key);

    if (next.submitted) {
      return state.value;
    }

    if (next.cancelled) {
      environment.error.write('Cancelled.\n');

      return state.value;
    }

    state = { cursor: next.cursor, value: next.value };
    highlighted = null;
    matches = await resolveSuggestions(options.options, state.value);
  }
};

export function suggest(options: SuggestOptions): Promise<string>;
export function suggest(
  label: string,
  options: string[] | ((query: string) => MaybePromise<string[]>),
  placeholder?: string,
  defaultValue?: string,
  scroll?: number,
  required?: boolean | string,
  validate?: TextPromptOptions['validate'],
  hint?: string,
  transform?: TextPromptOptions['transform']
): Promise<string>;
export async function suggest(
  message: string | SuggestOptions,
  source: string[] | ((query: string) => MaybePromise<string[]>) = [],
  placeholder = '',
  defaultValue = '',
  scroll = 5,
  required: boolean | string = false,
  validate: TextPromptOptions['validate'] = undefined,
  hint = '',
  transform: TextPromptOptions['transform'] = undefined
): Promise<string> {
  const options = suggestOptions(message, source, placeholder, defaultValue, scroll, required, validate, hint, transform);

  return promptUntilValid(options, async () => {
    const answer = await readSuggestionValue(options);
    const value = answer === '' && options.default !== undefined ? options.default : answer;

    return options.transform ? options.transform(value) : value;
  });
}

export const search = async <T>(options: SearchPromptOptions<T>): Promise<T> => {
  return promptUntilValid(options, async (attempt) => {
    const selected = await readSearchChoice(options, attempt);

    if (selected === undefined) {
      throw new PromptValidationError('Please select a valid option.');
    }

    return selected;
  });
};

export const multisearch = async <T>(options: MultiSearchPromptOptions<T>): Promise<T[]> => {
  return promptUntilValid(options, async () => {
    return readMultiSearchChoices(options);
  });
};

const resolveSearchChoices = async <T>(source: SearchPromptOptions<T>['options'], query: string): Promise<Array<Choice<T>>> => {
  const options = typeof source === 'function' ? await source(query) : source;

  return normalizeSearchChoices(options);
};

const readSearchChoice = async <T>(options: SearchPromptOptions<T>, attempt = 0): Promise<T | undefined> => {
  const environment = promptEnvironment();

  if (!environment.input.readKey) {
    const query = await ask(options.message, options.hint);
    const choices = await resolveSearchChoices(options.options, query);
    const choice = findChoice(choices, query) ?? choices.find((candidate) => !candidate.disabled);

    return choice?.value ?? options.default ?? choices[0]?.value;
  }

  let state = { cursor: 0, value: '' };
  let choices = await resolveSearchChoices(options.options, state.value);
  let highlighted: number | null = null;

  environment.output.write(`${options.message}\n`);

  while (true) {
    const key = await environment.input.readKey();

    if (key === null) {
      return options.default;
    }

    if (key === Key.down || key === Key.downArrow || key === Key.ctrlN || key === Key.tab) {
      choices = await resolveSearchChoices(options.options, state.value);
      highlighted = choices.length === 0 ? null : ((highlighted ?? (attempt > 0 ? 0 : -1)) + 1) % choices.length;
      renderInteractiveChoices(options.message, choices, highlighted ?? 0);
      continue;
    }

    if (key === Key.up || key === Key.upArrow || key === Key.ctrlP || key === Key.shiftTab) {
      choices = await resolveSearchChoices(options.options, state.value);
      highlighted = choices.length === 0 ? null : ((highlighted ?? choices.length) - 1 + choices.length) % choices.length;
      renderInteractiveChoices(options.message, choices, highlighted ?? 0);
      continue;
    }

    if (oneOf([Key.home, Key.ctrlA], key) && highlighted !== null) {
      highlighted = 0;
      continue;
    }

    if (oneOf([Key.end, Key.ctrlE], key) && highlighted !== null) {
      highlighted = Math.max(0, choices.length - 1);
      continue;
    }

    if (key === Key.enter) {
      if (highlighted !== null) {
        return choices[highlighted]?.value;
      }

      choices = await resolveSearchChoices(options.options, state.value);
      highlighted = choices.length > 0 ? 0 : null;
      continue;
    }

    const next = applyTypedKey(state, key);

    if (next.cancelled) {
      environment.error.write('Cancelled.\n');

      return options.default;
    }

    state = { cursor: next.cursor, value: next.value };
    highlighted = null;
    choices = await resolveSearchChoices(options.options, state.value);
  }
};

const readMultiSearchChoices = async <T>(options: MultiSearchPromptOptions<T>): Promise<T[]> => {
  const environment = promptEnvironment();

  if (!environment.input.readKey) {
    const query = await ask(options.message, options.hint);
    const choices = await resolveSearchChoices(options.options, query);

    if (query.trim() === '' && options.default !== undefined) {
      return options.default;
    }

    const selectedChoices = query
      .split(',')
      .map((part) => findChoice(choices, part.trim()))
      .filter((choice): choice is Choice<T> => choice !== undefined && !choice.disabled);

    if (selectedChoices.length !== query.split(',').length) {
      throw new PromptValidationError('Please select valid options.');
    }

    return selectedChoices.map((choice) => choice.value);
  }

  let state = { cursor: 0, value: '' };
  let choices = await resolveSearchChoices(options.options, state.value);
  let highlighted: number | null = null;
  const selected = new Map<T, string>();

  environment.output.write(`${options.message}\n`);

  while (true) {
    const key = await environment.input.readKey();

    if (key === null || key === Key.enter) {
      return [...selected.keys()];
    }

    if (key === Key.down || key === Key.downArrow || key === Key.ctrlN || key === Key.tab) {
      choices = await resolveSearchChoices(options.options, state.value);
      highlighted = choices.length === 0 ? null : ((highlighted ?? -1) + 1) % choices.length;
      renderInteractiveChoices(options.message, choices, highlighted ?? 0);
      continue;
    }

    if (key === Key.up || key === Key.upArrow || key === Key.ctrlP || key === Key.shiftTab) {
      choices = await resolveSearchChoices(options.options, state.value);
      highlighted = choices.length === 0 ? null : ((highlighted ?? choices.length) - 1 + choices.length) % choices.length;
      renderInteractiveChoices(options.message, choices, highlighted ?? 0);
      continue;
    }

    if (key === Key.space && highlighted !== null) {
      const choice = choices[highlighted];

      if (choice) {
        if (selected.has(choice.value as T)) {
          selected.delete(choice.value as T);
        } else {
          selected.set(choice.value as T, choice.label);
        }
      }

      continue;
    }

    const next = applyTypedKey(state, key);
    state = { cursor: next.cursor, value: next.value };
    choices = await resolveSearchChoices(options.options, state.value);
    highlighted = null;
  }
};

export function autocomplete(options: SuggestOptions): Promise<string>;
export function autocomplete(
  label: string,
  options?: string[] | ((query: string) => MaybePromise<string[]>),
  placeholder?: string,
  defaultValue?: string,
  required?: boolean | string,
  validate?: TextPromptOptions['validate'],
  hint?: string,
  transform?: TextPromptOptions['transform']
): Promise<string>;
export async function autocomplete(
  message: string | SuggestOptions,
  source: string[] | ((query: string) => MaybePromise<string[]>) = [],
  placeholder = '',
  defaultValue = '',
  required: boolean | string = false,
  validate: TextPromptOptions['validate'] = undefined,
  hint = '',
  transform: TextPromptOptions['transform'] = undefined
): Promise<string> {
  return suggest(
    typeof message === 'string'
      ? { message, label: message, options: source, placeholder, default: defaultValue, required, validate, hint, transform }
      : message
  );
}

export const pause = async (message = 'Press enter to continue'): Promise<void> => {
  await ask(message);
};
