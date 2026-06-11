import { promptEnvironment } from '#tui/environment';
import { renderQuestion } from '#tui/theme';

const startsWithInput = (match: string, value: string): boolean => {
	return match.toLowerCase().startsWith(value.toLowerCase());
};

const completionValue = (value: string, match: string | undefined, placeholder = ''): string => {
	if (value.length === 0) {
		return placeholder;
	}

	if (match === undefined || !startsWithInput(match, value) || match.length <= value.length) {
		return value;
	}

	return value + match.slice(value.length);
};

export const renderAutocomplete = (message: string, value: string, matches: string[], highlighted: number, hint = '', placeholder = ''): void => {
	promptEnvironment().output.write(`${renderQuestion(message, hint)}${completionValue(value, matches[highlighted], placeholder)}\n`);
};
