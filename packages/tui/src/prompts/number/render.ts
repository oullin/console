import { promptEnvironment } from '#tui/environment';
import { renderBox } from '#tui/theme/box';
import { cyan, dim, red, strikethrough } from '#tui/theme/styles';
import type { NumberInputOptions } from '#tui/prompts/number/types';

const UP_ARROW = '▲';
const DOWN_ARROW = '▼';

const renderNumberArrows = (value: string, options: NumberInputOptions, style: (text: string) => string = (text) => text): string => {
	const numeric = value !== '' && !Number.isNaN(Number(value));
	const number = Number(value);
	const up = numeric && options.max !== undefined && number >= options.max ? dim(UP_ARROW) : style(UP_ARROW);
	const down = numeric && options.min !== undefined && number <= options.min ? dim(DOWN_ARROW) : style(DOWN_ARROW);

	if (value !== '' && !numeric) {
		return `${dim(UP_ARROW)}${dim(DOWN_ARROW)}`;
	}

	return `${up}${down}`;
};

const renderNumberBody = (value: string, options: NumberInputOptions, style?: (text: string) => string): string => {
	const displayValue = value.length > 0 ? value : dim(options.placeholder ?? '');

	return `${displayValue}  ${renderNumberArrows(value, options, style)}`;
};

export const renderNumberValue = (message: string, value: string, options: NumberInputOptions): void => {
	promptEnvironment().output.write(`${renderBox({ body: renderNumberBody(value, options), borderStyle: cyan, info: options.hint, title: cyan(message) })}\n`);
};

export const renderSubmittedNumberValue = (message: string, value: number | string): void => {
	promptEnvironment().output.write(`${renderBox({ body: String(value), title: dim(message) })}\n`);
};

export const renderCancelledNumberValue = (message: string, value: string, options: NumberInputOptions): void => {
	const environment = promptEnvironment();
	const displayValue = value.length > 0 ? value : (options.placeholder ?? '');

	environment.output.write(`${renderBox({ body: strikethrough(dim(displayValue)), borderStyle: red, title: message })}\n`);
	environment.error.write(`${red('  ⚠ Cancelled.')}\n`);
};
