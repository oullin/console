import { ProcessOutputBuffer } from '#tui/status/task/process-output/buffer';
import { processOutputWriter } from '#tui/status/task/process-output/writer';
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
			stdout.write = originalStdoutWrite;
			stderr.write = originalStderrWrite;
			buffer.flush();
		},
	};
};
