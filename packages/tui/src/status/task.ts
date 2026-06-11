import { promptEnvironment } from '#tui/environment';
import { Logger } from '#tui/status/task/logger';
import { renderTaskFrame } from '#tui/status/task/render';
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

	output.write(
		renderTaskFrame({
			label: logger.labelValue,
			limit: logger.limitValue,
			lines: logger.lines,
			stableMessages: logger.stableMessages,
			subLabel: logger.subLabelValue,
		}),
	);

	try {
		const result = await run(logger);

		output.write(
			renderTaskFrame({
				finished: true,
				keepSummary: summary,
				label: logger.labelValue,
				limit: logger.limitValue,
				lines: logger.lines,
				stableMessages: summary ? logger.stableMessages : [],
				subLabel: logger.subLabelValue,
			}),
		);

		return result;
	} catch (error) {
		output.write(
			renderTaskFrame({
				label: logger.labelValue,
				limit: logger.limitValue,
				lines: logger.lines,
				stableMessages: logger.stableMessages,
				subLabel: logger.subLabelValue,
			}),
		);

		throw error;
	}
}
