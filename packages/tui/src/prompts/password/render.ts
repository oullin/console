import { promptEnvironment } from '#tui/environment';
import { renderBox } from '#tui/theme/box';
import { cyan, dim, red, strikethrough } from '#tui/theme/styles';
import type { PasswordInputOptions } from '#tui/prompts/password/types';

export const maskPassword = (value: string): string => '•'.repeat([...value].length);

export const passwordLength = (value: string): number => [...value].length;

const passwordDisplay = (value: string, options: PasswordInputOptions): string => {
	return value.length > 0 ? maskPassword(value) : dim(options.placeholder ?? '');
};

export const renderPasswordValue = (message: string, value: string, options: PasswordInputOptions): void => {
	promptEnvironment().output.write(`${renderBox({ body: passwordDisplay(value, options), borderStyle: cyan, info: options.hint, title: cyan(message) })}\n`);
};

export const renderSubmittedPasswordValue = (message: string, value: string): void => {
	promptEnvironment().output.write(`${renderBox({ body: maskPassword(value), title: dim(message) })}\n`);
};

export const renderCancelledPasswordValue = (message: string, value: string, options: PasswordInputOptions): void => {
	const environment = promptEnvironment();
	const displayValue = value.length > 0 ? maskPassword(value) : (options.placeholder ?? '');

	environment.output.write(`${renderBox({ body: strikethrough(dim(displayValue)), borderStyle: red, title: message })}\n`);
	environment.error.write(`${red('  ⚠ Cancelled.')}\n`);
};
