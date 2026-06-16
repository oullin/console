import { sanitizeTaskLine } from '#tui/status/task/sanitize';

export type PartialTaskLogState = {
	startIndex: number | null;
	value: string;
};

export const appendTaskLogLines = (lines: string[], message: string, limit: number): void => {
	for (const line of message.split(/\r?\n/u).filter((value) => value.length > 0)) {
		lines.push(sanitizeTaskLine(line));
	}

	while (lines.length > limit) {
		lines.shift();
	}
};

export const appendPartialTaskLog = (lines: string[], partial: PartialTaskLogState, chunk: string, limit: number): PartialTaskLogState => {
	const value = `${partial.value}${chunk}`;
	const startIndex = partial.startIndex ?? lines.length;

	lines.splice(startIndex);
	appendTaskLogLines(lines, value, limit);

	return {
		startIndex: Math.min(startIndex, lines.length),
		value,
	};
};
