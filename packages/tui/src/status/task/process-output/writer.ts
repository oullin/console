import type { ProcessOutputBuffer } from '#tui/status/task/process-output/buffer';

export const processOutputWriter = (buffer: ProcessOutputBuffer) => {
	return (chunk: string | Uint8Array, encodingOrCallback?: BufferEncoding | ((error?: Error | null) => void), callback?: (error?: Error | null) => void): boolean => {
		const encoding = typeof encodingOrCallback === 'string' ? encodingOrCallback : undefined;
		const done = typeof encodingOrCallback === 'function' ? encodingOrCallback : callback;
		const content = typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString(encoding);

		buffer.write(content);
		done?.();

		return true;
	};
};
