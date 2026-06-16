import { parseProcessOutputCallback, parseProcessOutputChunk, parseProcessOutputEncoding } from '#tui/status/task/process-output/validators/writer';
import type { ProcessOutputBuffer } from '#tui/status/task/process-output/buffer';

export const processOutputWriter = (buffer: ProcessOutputBuffer) => {
	return (chunk: string | Uint8Array, encodingOrCallback?: BufferEncoding | ((error?: Error | null) => void), callback?: (error?: Error | null) => void): boolean => {
		const encoding = parseProcessOutputEncoding(encodingOrCallback);
		const done = parseProcessOutputCallback(encodingOrCallback, callback);
		const content = parseProcessOutputChunk(chunk, encoding);

		buffer.write(content);
		done?.();

		return true;
	};
};
