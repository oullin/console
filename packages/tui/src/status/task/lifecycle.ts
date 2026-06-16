import { promptEnvironment } from '#tui/environment';
import { eraseRenderedFrame } from '#tui/status/frame';
import { StatusSignalCleanup } from '#tui/status/signals';
import { Logger } from '#tui/status/task/logger';
import { captureTaskProcessOutput } from '#tui/status/task/process-output';
import { renderTaskFrame } from '#tui/status/task/render';
import { hideCursor, showCursor } from '#tui/terminal';
import type { ResolvedTaskDefinition } from '#tui/status/task/definition';

const renderLoggerTaskFrame = (logger: Logger, options: { finished?: boolean; keepSummary?: boolean } = {}): string => {
	const finished = options.finished ?? false;
	const keepSummary = options.keepSummary ?? false;

	return renderTaskFrame({
		finished,
		keepSummary,
		label: logger.labelValue,
		limit: logger.limitValue,
		lines: logger.lines,
		stableMessages: finished && !keepSummary ? [] : logger.stableMessages,
		subLabel: logger.subLabelValue,
	});
};

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
