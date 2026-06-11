import { renderScrollbarRows } from '#tui/concerns/scrollbar';
import { renderBox } from '#tui/theme/box';
import { dim } from '#tui/theme/styles';
import { visibleLineWindow } from '#tui/typed-value/lines';
import type { TypedValueOptions, TypedValueState } from '#tui/typed-value/types';

export const renderTextareaFrame = (message: string, state: TypedValueState, options: TypedValueOptions): string => {
	return renderBox({ body: textareaBody(state, options), title: message });
};

const textareaBody = (state: TypedValueState, options: TypedValueOptions): string => {
	const rows = options.rows === undefined || options.rows <= 0 ? undefined : Math.floor(options.rows);

	if (state.value.length === 0) {
		return placeholderBody(options, rows);
	}

	const window = visibleLineWindow(state.value, state.cursor, rows);

	if (rows === undefined) {
		return window.lines.join('\n');
	}

	const padded = [...window.lines.slice(0, rows), ...Array.from({ length: Math.max(0, rows - window.lines.length) }, () => '')];

	return renderScrollbarRows(padded, window.start, rows, window.total).join('\n');
};

const placeholderBody = (options: TypedValueOptions, rows: number | undefined): string => {
	const lines = [dim(options.placeholder ?? '')];

	if (rows === undefined) {
		return lines.join('\n');
	}

	return [...lines, ...Array.from({ length: Math.max(0, rows - lines.length) }, () => '')].join('\n');
};
