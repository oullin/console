import type { Logger } from '#tui/status/task/logger';

type WritableProcessStream = {
	write: NodeJS.WriteStream['write'];
};

type TaskProcessOutputCapture = {
	stop(): void;
};

export const captureTaskProcessOutput = (logger: Logger): TaskProcessOutputCapture => {
	const stdout = process.stdout as WritableProcessStream;
	const stderr = process.stderr as WritableProcessStream;
	const originalStdoutWrite = stdout.write;
	const originalStderrWrite = stderr.write;
	const buffer = new ProcessOutputBuffer(logger);

	let stopped = false;

	stdout.write = processOutputWriter(buffer) as NodeJS.WriteStream['write'];
	stderr.write = processOutputWriter(buffer) as NodeJS.WriteStream['write'];

	return {
		stop(): void {
			if (stopped) {
				return;
			}

			stopped = true;
			buffer.flush();
			stdout.write = originalStdoutWrite;
			stderr.write = originalStderrWrite;
		},
	};
};

class ProcessOutputBuffer {
	#pending = '';
	readonly #logger: Logger;

	constructor(logger: Logger) {
		this.#logger = logger;
	}

	write(chunk: string): void {
		const lines = `${this.#pending}${chunk}`.split(/\r?\n/u);

		this.#pending = lines.pop() ?? '';

		for (const line of lines) {
			if (line.length > 0) {
				this.#logger.line(line);
			}
		}
	}

	flush(): void {
		if (this.#pending.length === 0) {
			return;
		}

		this.#logger.line(this.#pending);
		this.#pending = '';
	}
}

const processOutputWriter = (buffer: ProcessOutputBuffer) => {
	return (chunk: string | Uint8Array, encodingOrCallback?: BufferEncoding | ((error?: Error | null) => void), callback?: (error?: Error | null) => void): boolean => {
		const encoding = typeof encodingOrCallback === 'string' ? encodingOrCallback : undefined;
		const done = typeof encodingOrCallback === 'function' ? encodingOrCallback : callback;
		const content = typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString(encoding);

		buffer.write(content);
		done?.();

		return true;
	};
};
