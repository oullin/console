import { promptEnvironment } from '#tui/environment';
import { eraseRenderedFrame } from '#tui/status/frame';
import { Logger } from '#tui/status/task/logger';
import { captureTaskProcessOutput } from '#tui/status/task/process-output';
import { renderTaskFrame } from '#tui/status/task/render';
import { hideCursor, showCursor } from '#tui/terminal';
import type { MaybePromise } from '#tui/types';

export type TaskDefinition<T> = {
	keepSummary?: boolean;
	subLabel?: string;
	title: string;
	limit?: number;
	task: (logger: Logger) => MaybePromise<T>;
};

export { Logger };

export async function task<T>(definition: TaskDefinition<T>): Promise<T>;

export async function task<T>(label: string, callback: (logger: Logger) => MaybePromise<T>, limit?: number, keepSummary?: boolean, subLabel?: string): Promise<T>;

export async function task<T>(definitionOrLabel: TaskDefinition<T> | string, callback?: (logger: Logger) => MaybePromise<T>, limit = 10, keepSummary = false, subLabel?: string): Promise<T> {
	const title = typeof definitionOrLabel === 'string' ? definitionOrLabel : definitionOrLabel.title;
	const run = typeof definitionOrLabel === 'string' ? callback : definitionOrLabel.task;
	const summary = typeof definitionOrLabel === 'string' ? keepSummary : (definitionOrLabel.keepSummary ?? keepSummary);
	const subtitle = typeof definitionOrLabel === 'string' ? subLabel : (definitionOrLabel.subLabel ?? subLabel);

	if (!run) {
		throw new Error('A task callback is required.');
	}

	const logger = new Logger(typeof definitionOrLabel === 'string' ? limit : (definitionOrLabel.limit ?? limit), title, subtitle ?? '');

	const output = promptEnvironment().output;

	hideCursor();

	let frame = renderTaskFrame({
		label: logger.labelValue,
		limit: logger.limitValue,
		lines: logger.lines,
		stableMessages: logger.stableMessages,
		subLabel: logger.subLabelValue,
	});

	output.write(frame);

	const processOutput = captureTaskProcessOutput(logger);

	try {
		const result = await run(logger);

		processOutput.stop();
		eraseRenderedFrame(frame);
		frame = renderTaskFrame({
			finished: true,
			keepSummary: summary,
			label: logger.labelValue,
			limit: logger.limitValue,
			lines: logger.lines,
			stableMessages: summary ? logger.stableMessages : [],
			subLabel: logger.subLabelValue,
		});
		output.write(frame);

		return result;
	} catch (error) {
		processOutput.stop();
		eraseRenderedFrame(frame);
		frame = renderTaskFrame({
			label: logger.labelValue,
			limit: logger.limitValue,
			lines: logger.lines,
			stableMessages: logger.stableMessages,
			subLabel: logger.subLabelValue,
		});
		output.write(frame);

		throw error;
	} finally {
		showCursor();
	}
}
