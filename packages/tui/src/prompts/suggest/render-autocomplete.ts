import { promptEnvironment } from '#tui/environment';

const startsWithInput = (match: string, value: string): boolean => {
	return match.toLowerCase().startsWith(value.toLowerCase());
};

const completionValue = (value: string, match: string | undefined): string => {
	if (match === undefined || value.length === 0 || !startsWithInput(match, value) || match.length <= value.length) {
		return value;
	}

	return value + match.slice(value.length);
};

export const renderAutocomplete = (message: string, value: string, matches: string[], highlighted: number): void => {
	promptEnvironment().output.write(`${message} ${completionValue(value, matches[highlighted])}\n`);
};
