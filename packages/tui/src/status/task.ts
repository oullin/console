import { promptEnvironment } from '#tui/environment';
import type { MaybePromise } from '#tui/types';

const cursorReset = `${String.fromCharCode(27)}[1G`;
const eraseLine = `${String.fromCharCode(27)}[2K`;

export type TaskDefinition<T> = {
	title: string;
	limit?: number;
	task: (logger: Logger) => MaybePromise<T>;
};

export class Logger {
	readonly lines: string[] = [];

	constructor(private readonly limit: number) {}

	log(message: string): void {
		for (const line of message.split(/\r?\n/u).filter((value) => value.length > 0)) {
			this.lines.push(line.replaceAll(cursorReset, '').replaceAll(eraseLine, ''));
		}

		while (this.lines.length > this.limit) {
			this.lines.shift();
		}
	}

	info(message: string): void {
		this.log(message);
	}

	success(message: string): void {
		this.log(message);
	}

	warning(message: string): void {
		this.log(message);
	}

	error(message: string): void {
		this.log(message);
	}
}

export async function task<T>(definition: TaskDefinition<T>): Promise<T>;

export async function task<T>(label: string, callback: (logger: Logger) => MaybePromise<T>, limit?: number, keepSummary?: boolean, subLabel?: string): Promise<T>;

export async function task<T>(definitionOrLabel: TaskDefinition<T> | string, callback?: (logger: Logger) => MaybePromise<T>, limit = 10, _keepSummary = false, subLabel?: string): Promise<T> {
	const title = typeof definitionOrLabel === 'string' ? definitionOrLabel : definitionOrLabel.title;
	const run = typeof definitionOrLabel === 'string' ? callback : definitionOrLabel.task;

	if (!run) {
		throw new Error('A task callback is required.');
	}

	const logger = new Logger(typeof definitionOrLabel === 'string' ? limit : (definitionOrLabel.limit ?? limit));

	promptEnvironment().output.write(`${title}${subLabel ? ` ${subLabel}` : ''}\n`);

	const result = await run(logger);

	for (const line of logger.lines) {
		promptEnvironment().output.write(`${line}\n`);
	}

	promptEnvironment().output.write(`Done: ${title}\n`);

	return result;
}
