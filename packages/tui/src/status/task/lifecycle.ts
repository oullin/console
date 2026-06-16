import { promptEnvironment } from '#tui/environment';
import { eraseRenderedFrame } from '#tui/status/frame';
import { StatusSignalCleanup } from '#tui/status/signals';
import { Logger } from '#tui/status/task/logger';
import { captureTaskProcessOutput } from '#tui/status/task/process-output';
import { renderLoggerTaskFrame } from '#tui/status/task/frame';
import { hideCursor, showCursor } from '#tui/terminal';
import type { ResolvedTaskDefinition } from '#tui/status/task/definition';

export const runTaskLifecycle = async <T>(definition: ResolvedTaskDefinition<T>): Promise<T> => {
	const logger = new Logger(definition.limit, definition.title, definition.subLabel);
	const output = promptEnvironment().output;

	hideCursor();

	let frame = renderLoggerTaskFrame(logger);

	output.write(frame);

	const processOutput = captureTaskProcessOutput(logger);

	const cleanup = new StatusSignalCleanup(() => {
		processOutput.stop();
		eraseRenderedFrame(frame);
		showCursor();
	}).attach();

	try {
		const result = await definition.run(logger);

		processOutput.stop();
		eraseRenderedFrame(frame);
		frame = renderLoggerTaskFrame(logger, { finished: true, keepSummary: definition.keepSummary });
		output.write(frame);

		return result;
	} catch (error) {
		processOutput.stop();
		eraseRenderedFrame(frame);
		frame = renderLoggerTaskFrame(logger);
		output.write(frame);

		throw error;
	} finally {
		cleanup.detach();
		showCursor();
	}
};
