import { streamLines } from '#tui/status/stream/render';
import type { StreamBuffer } from '#tui/status/stream/buffer';

export const streamBufferValue = (buffer: StreamBuffer): string => {
	return buffer.value();
};

export const streamBufferLines = (buffer: StreamBuffer): string[] => {
	return streamLines({ value: streamBufferValue(buffer) });
};
