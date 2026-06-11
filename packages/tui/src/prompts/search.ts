import { promptEnvironment } from '#tui/environment';
import { Key, oneOf } from '#tui/key';
import { ask, promptUntilValid, PromptValidationError } from '#tui/prompt';
import { applyTypedKey } from '#tui/typed-value';
import { findChoice, normalizeSearchChoices, renderInteractiveChoices } from '#tui/concerns/choices';
import type { Choice, MultiSearchPromptOptions, SearchPromptOptions } from '#tui/types';

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

export const multisearch = async <T>(options: MultiSearchPromptOptions<T>): Promise<T[]> => {
  return promptUntilValid(options, async () => readMultiSearchChoices(options));
};
