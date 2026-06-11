import { renderBox } from '#tui/theme/box';
import { dim } from '#tui/theme/styles';
import type { TypedValueOptions } from '#tui/typed-value/types';

export const renderTextareaFrame = (message: string, displayValue: string, options: TypedValueOptions): string => {
	return renderBox({ body: textareaBody(displayValue, options), title: message });
};

const textareaBody = (displayValue: string, options: TypedValueOptions): string => {
	const rows = options.rows === undefined || options.rows <= 0 ? undefined : Math.floor(options.rows);
	const lines = displayValue.split('\n');

	if (isPlaceholder(displayValue, options)) {
		lines[0] = dim(displayValue);
	}

	if (rows === undefined) {
		return lines.join('\n');
	}

	return [...lines.slice(0, rows), ...Array.from({ length: Math.max(0, rows - lines.length) }, () => '')].join('\n');
};

const isPlaceholder = (displayValue: string, options: TypedValueOptions): boolean => {
	return displayValue.length > 0 && displayValue === options.placeholder;
};
