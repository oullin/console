import { promptEnvironment } from '#tui/environment';
import { renderBox } from '#tui/theme/box';
import { cyan, dim, red, strikethrough } from '#tui/theme/styles';
import { placeholderWithCursor, valueWithCursor } from '#tui/typed-value/cursor';
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

const renderNumberBody = (value: string, cursor: number, options: NumberInputOptions, style?: (text: string) => string): string => {
	const displayValue = value.length > 0 ? valueWithCursor(value, cursor) : placeholderWithCursor(options.placeholder);
	const arrows = renderNumberArrows(value, options, style);
	const separator = value.length > 0 ? ' ' : '  ';

	return `${displayValue}${separator}${arrows}`;
};

export const renderNumberValue = (message: string, value: string, cursor: number, options: NumberInputOptions): string => {
	const frame = `${renderBox({ body: renderNumberBody(value, cursor, options), borderStyle: cyan, info: options.hint, title: cyan(message) })}\n`;

	promptEnvironment().output.write(frame);

	return frame;
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
