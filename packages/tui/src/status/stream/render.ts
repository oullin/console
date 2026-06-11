import { wrap } from '#tui/strings';

type StreamFrameOptions = {
	value: string;
	width?: number;
};

export const streamLines = ({ value, width = 60 }: StreamFrameOptions): string[] => {
	return value.split(/\r?\n/u).flatMap((line) => wrap(line, width));
};

export const renderStreamFrame = (options: StreamFrameOptions): string => {
	return `${streamLines(options)
		.map((line) => ` ${line}`)
		.join('\n')}\n`;
};
