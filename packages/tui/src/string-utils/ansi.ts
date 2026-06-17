import stripAnsi from 'strip-ansi';

export { ansiCloseSequence, ESC } from '#tui/string-utils/ansi/codes';
export { parseAnsiSegments } from '#tui/string-utils/ansi/segments';
export type { AnsiSegment } from '#tui/string-utils/ansi/segments';

export const parseAnsiText = (value: string): string => stripAnsi(value);
