import { promptEnvironment } from '#tui/environment';
import { resolveInfo } from '#tui/concerns/info';
import { autocompleteDisplayValue } from '#tui/prompts/suggest/ghost-text';
import { renderBox } from '#tui/theme/box';
import { cyan, dim, red, strikethrough } from '#tui/theme/styles';
import type { SuggestOptions } from '#tui/prompts/suggest/options';
import type { TypedValueState } from '#tui/typed-value/types';

export const renderAutocomplete = (message: string, state: TypedValueState, matches: string[], highlighted: number, hint = '', placeholder = '', info?: SuggestOptions['info']): void => {
	const value = state.value.length === 0 ? dim(placeholder) : autocompleteDisplayValue(state, matches[highlighted], placeholder);
	const details = [hint, resolveInfo(info, matches[highlighted] ?? null)].filter((part) => part.length > 0).join(' · ');

	promptEnvironment().output.write(`${renderBox({ body: value, borderStyle: cyan, info: details, title: cyan(message) })}\n`);
};

export const renderSubmittedAutocomplete = (message: string, value: string): void => {
	promptEnvironment().output.write(`${renderBox({ body: value, title: dim(message) })}\n`);
};

export const renderCancelledAutocomplete = (message: string, value: string, placeholder = ''): void => {
	const environment = promptEnvironment();
	const displayValue = value.length > 0 ? value : placeholder;

	environment.output.write(`${renderBox({ body: strikethrough(dim(displayValue)), borderStyle: red, title: message })}\n`);
	environment.error.write(`${red('  ⚠ Cancelled.')}\n`);
};
