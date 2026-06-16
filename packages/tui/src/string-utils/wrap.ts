import stripAnsi from 'strip-ansi';
import { restoreAnsiWrappedLines } from '#tui/string-utils/wrap/ansi';
import { plainWrap } from '#tui/string-utils/wrap/plain';

export const wrap = (value: string, width: number): string[] => {
	return restoreAnsiWrappedLines(value, plainWrap(stripAnsi(value), width));
};
