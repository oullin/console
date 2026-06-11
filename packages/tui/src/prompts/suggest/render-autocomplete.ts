import { promptEnvironment } from '#tui/environment';
import { autocompleteDisplayValue } from '#tui/prompts/suggest/ghost-text';
import { renderQuestion } from '#tui/theme';
import type { TypedValueState } from '#tui/typed-value/types';

export const renderAutocomplete = (message: string, state: TypedValueState, matches: string[], highlighted: number, hint = '', placeholder = ''): void => {
	promptEnvironment().output.write(`${renderQuestion(message, hint)}${autocompleteDisplayValue(state, matches[highlighted], placeholder)}\n`);
};
