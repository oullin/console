import { promptEnvironment } from '#tui/environment';
import { Key, oneOf } from '#tui/key';
import { ask, promptUntilValid } from '#tui/prompt';
import { applyTypedKey } from '#tui/typed-value';
import { renderInteractiveChoices } from '#tui/concerns/choices';
import type { MaybePromise, TextPromptOptions } from '#tui/types';

export type SuggestOptions = TextPromptOptions & {
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

const renderSuggestions = (message: string, value: string, matches: string[], highlighted: number | null, scroll?: number): void => {
  renderInteractiveChoices(
    value.length > 0 ? `${message} ${value}` : message,
    matches.map((match) => ({ label: match, value: match })),
    highlighted ?? 0,
    new Set(),
    scroll
  );
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

  renderSuggestions(options.message, state.value, matches, highlighted, options.scroll);

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

      matches = await resolveSuggestions(options.options, state.value);
      highlighted = null;
      renderSuggestions(options.message, state.value, matches, highlighted, options.scroll);
      continue;
    }

    if (key === Key.down || key === Key.downArrow || key === Key.ctrlN || key === Key.shiftTab) {
      matches = await resolveSuggestions(options.options, state.value);
      highlighted = matches.length === 0 ? null : ((highlighted ?? -1) + 1) % matches.length;
      renderSuggestions(options.message, state.value, matches, highlighted, options.scroll);
      continue;
    }

    if (key === Key.up || key === Key.upArrow || key === Key.ctrlP) {
      matches = await resolveSuggestions(options.options, state.value);
      highlighted = matches.length === 0 ? null : ((highlighted ?? matches.length) - 1 + matches.length) % matches.length;
      renderSuggestions(options.message, state.value, matches, highlighted, options.scroll);
      continue;
    }

    if (oneOf([Key.home, Key.ctrlA], key) && highlighted !== null) {
      highlighted = 0;
      renderSuggestions(options.message, state.value, matches, highlighted, options.scroll);
      continue;
    }

    if (oneOf([Key.end, Key.ctrlE], key) && highlighted !== null) {
      highlighted = Math.max(0, matches.length - 1);
      renderSuggestions(options.message, state.value, matches, highlighted, options.scroll);
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
    renderSuggestions(options.message, state.value, matches, highlighted, options.scroll);
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
