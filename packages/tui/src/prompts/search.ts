import { promptEnvironment } from '#tui/environment';
import { Key, oneOf } from '#tui/key';
import { ask, promptUntilValid, PromptValidationError } from '#tui/prompt';
import { applyTypedKey } from '#tui/typed-value';
import { findChoice, normalizeSearchChoices, renderInteractiveChoices } from '#tui/concerns/choices';
import { resolveInfo } from '#tui/concerns/info';
import type { Choice, MultiSearchPromptOptions, SearchPromptOptions } from '#tui/types';

const resolveSearchChoices = async <T>(source: SearchPromptOptions<T>['options'], query: string): Promise<Array<Choice<T>>> => {
  const options = typeof source === 'function' ? await source(query) : source;

  return normalizeSearchChoices(options);
};

const searchMessage = (message: string, query: string): string => {
  return query.length > 0 ? `${message} ${query}` : message;
};

const renderSearchChoices = <T>(
  message: string,
  query: string,
  choices: Array<Choice<T>>,
  highlighted: number | null,
  marked: Set<number> = new Set(),
  selectedLabels: string[] = [],
  scroll?: number,
  info?: SearchPromptOptions<T>['info'] | MultiSearchPromptOptions<T>['info']
): void => {
  renderInteractiveChoices(searchMessage(message, query), choices, highlighted ?? 0, marked, scroll);

  const text = resolveInfo(info, highlighted === null ? null : choices[highlighted]?.value ?? null);

  if (text.length > 0) {
    promptEnvironment().output.write(`${text}\n`);
  }

  if (selectedLabels.length > 0) {
    promptEnvironment().output.write(`Selected: ${selectedLabels.join(', ')}\n`);
  }
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

  renderSearchChoices(options.message, state.value, choices, highlighted, new Set(), [], options.scroll, options.info);

  while (true) {
    const key = await environment.input.readKey();

    if (key === null) {
      return options.default;
    }

    if (key === Key.down || key === Key.downArrow || key === Key.ctrlN || key === Key.tab) {
      choices = await resolveSearchChoices(options.options, state.value);
      highlighted = choices.length === 0 ? null : ((highlighted ?? (attempt > 0 ? 0 : -1)) + 1) % choices.length;
      renderSearchChoices(options.message, state.value, choices, highlighted, new Set(), [], options.scroll, options.info);
      continue;
    }

    if (key === Key.up || key === Key.upArrow || key === Key.ctrlP || key === Key.shiftTab) {
      choices = await resolveSearchChoices(options.options, state.value);
      highlighted = choices.length === 0 ? null : ((highlighted ?? choices.length) - 1 + choices.length) % choices.length;
      renderSearchChoices(options.message, state.value, choices, highlighted, new Set(), [], options.scroll, options.info);
      continue;
    }

    if (oneOf([Key.home, Key.ctrlA], key) && highlighted !== null) {
      highlighted = 0;
      renderSearchChoices(options.message, state.value, choices, highlighted, new Set(), [], options.scroll, options.info);
      continue;
    }

    if (oneOf([Key.end, Key.ctrlE], key) && highlighted !== null) {
      highlighted = Math.max(0, choices.length - 1);
      renderSearchChoices(options.message, state.value, choices, highlighted, new Set(), [], options.scroll, options.info);
      continue;
    }

    if (key === Key.enter) {
      if (highlighted !== null) {
        return choices[highlighted]?.value;
      }

      choices = await resolveSearchChoices(options.options, state.value);
      highlighted = choices.length > 0 ? 0 : null;
      renderSearchChoices(options.message, state.value, choices, highlighted, new Set(), [], options.scroll, options.info);
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
    renderSearchChoices(options.message, state.value, choices, highlighted, new Set(), [], options.scroll, options.info);
  }
};

export const search = async <T>(options: SearchPromptOptions<T>): Promise<T> => {
  return promptUntilValid(options, async (attempt) => {
    const selected = await readSearchChoice(options, attempt);

    if (selected === undefined) {
      throw new PromptValidationError('Please select a valid option.');
    }

    return selected;
  });
};

const readMultiSearchChoices = async <T>(options: MultiSearchPromptOptions<T>): Promise<T[]> => {
  const environment = promptEnvironment();

  if (!environment.input.readKey) {
    const query = await ask(options.message, options.hint);
    const choices = await resolveSearchChoices(options.options, query);

    if (query.trim() === '' && options.default !== undefined) {
      return options.default;
    }

    const parts = query.split(',').map((part) => part.trim()).filter((part) => part.length > 0);
    const selectedChoices = parts
      .map((part) => findChoice(choices, part))
      .filter((choice): choice is Choice<T> => choice !== undefined && !choice.disabled);

    if (selectedChoices.length !== parts.length) {
      throw new PromptValidationError('Please select valid options.');
    }

    return selectedChoices.map((choice) => choice.value);
  }

  let state = { cursor: 0, value: '' };
  let choices = await resolveSearchChoices(options.options, state.value);
  let highlighted: number | null = null;
  const selected = new Map<T, string>();

  const render = (): void => {
    const marked = new Set(choices.flatMap((choice, index) => selected.has(choice.value) ? [index] : []));

    renderSearchChoices(options.message, state.value, choices, highlighted, marked, [...selected.values()], options.scroll, options.info);
  };

  render();

  while (true) {
    const key = await environment.input.readKey();

    if (key === null || key === Key.enter) {
      return [...selected.keys()];
    }

    if (key === Key.down || key === Key.downArrow || key === Key.ctrlN || key === Key.tab) {
      choices = await resolveSearchChoices(options.options, state.value);
      highlighted = choices.length === 0 ? null : ((highlighted ?? -1) + 1) % choices.length;
      render();
      continue;
    }

    if (key === Key.up || key === Key.upArrow || key === Key.ctrlP || key === Key.shiftTab) {
      choices = await resolveSearchChoices(options.options, state.value);
      highlighted = choices.length === 0 ? null : ((highlighted ?? choices.length) - 1 + choices.length) % choices.length;
      render();
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

      render();
      continue;
    }

    const next = applyTypedKey(state, key);

    if (next.cancelled) {
      environment.error.write('Cancelled.\n');

      return options.default ?? [];
    }

    state = { cursor: next.cursor, value: next.value };
    choices = await resolveSearchChoices(options.options, state.value);
    highlighted = null;
    render();
  }
};

export const multisearch = async <T>(options: MultiSearchPromptOptions<T>): Promise<T[]> => {
  return promptUntilValid(options, async () => readMultiSearchChoices(options));
};
