import { promptEnvironment } from '#tui/environment';
import { Logger } from '#tui/status/task/logger';
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

	promptEnvironment().output.write(`${title}${subtitle ? ` ${subtitle}` : ''}\n`);

	const result = await run(logger);

	for (const line of logger.lines) {
		promptEnvironment().output.write(`${line}\n`);
	}

	if (summary) {
		for (const message of logger.stableMessages) {
			promptEnvironment().output.write(`${message.type}: ${message.message}\n`);
		}
	}

	promptEnvironment().output.write(`Done: ${logger.labelValue}${logger.subLabelValue ? ` ${logger.subLabelValue}` : ''}\n`);

	return result;
}
