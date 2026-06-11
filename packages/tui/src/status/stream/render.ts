import { wrap } from '#tui/strings';
import type { StreamFadeStyle } from '#tui/status/stream/fade';

type StreamFrameOptions = {
	fading?: string[];
	fadeStyles?: StreamFadeStyle[];
	value: string;
	width?: number;
};

const fadedValue = (value: string, fading: string[], styles: StreamFadeStyle[]): string => {
	return `${value}${fading.map((chunk, index) => (styles[index] ?? styles.at(-1) ?? ((text: string) => text))(chunk)).join('')}`;
};

export const streamLines = ({ value, width = 60 }: StreamFrameOptions): string[] => {
	return value.split(/\r?\n/u).flatMap((line) => wrap(line, width));
};

export const renderStreamFrame = (options: StreamFrameOptions): string => {
	const value = fadedValue(options.value, options.fading ?? [], options.fadeStyles ?? []);

	return `${streamLines({ ...options, value })
		.map((line) => ` ${line}`)
		.join('\n')}\n`;
};
