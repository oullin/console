import { ProcessOutputBuffer } from '#tui/status/task/process-output/buffer';
import { parseProcessOutputWrite, parseWritableProcessStream } from '#tui/status/task/process-output/validators/writer';
import { processOutputWriter } from '#tui/status/task/process-output/writer';
import type { Logger } from '#tui/status/task/logger';

type TaskProcessOutputCapture = {
	stop(): void;
};

export const captureTaskProcessOutput = (logger: Logger): TaskProcessOutputCapture => {
	const stdout = parseWritableProcessStream(process.stdout);
	const stderr = parseWritableProcessStream(process.stderr);
	const originalStdoutWrite = stdout.write;
	const originalStderrWrite = stderr.write;
	const buffer = new ProcessOutputBuffer(logger);

	let stopped = false;

	stdout.write = parseProcessOutputWrite(processOutputWriter(buffer));
	stderr.write = parseProcessOutputWrite(processOutputWriter(buffer));

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
