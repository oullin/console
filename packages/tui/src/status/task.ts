import { promptEnvironment } from '#tui/environment';
import { parseLogLimit } from '#tui/status/validators/limit';
import type { MaybePromise } from '#tui/types';

const cursorReset = `${String.fromCharCode(27)}[1G`;
const eraseLine = `${String.fromCharCode(27)}[2K`;

export type TaskDefinition<T> = {
	keepSummary?: boolean;
	subLabel?: string;
	title: string;
	limit?: number;
	task: (logger: Logger) => MaybePromise<T>;
};

type StableMessage = {
	message: string;
	type: 'error' | 'success' | 'warning';
};

export class Logger {
	labelValue: string;
	readonly lines: string[] = [];
	readonly stableMessages: StableMessage[] = [];
	subLabelValue: string;
	#partialBuffer = '';
	#partialStartIndex: number | null = null;
	private readonly limit: number;
	private readonly stableLimit: number;

	constructor(limit: number, label: string, subLabel = '') {
		this.limit = parseLogLimit(limit, 10);
		this.stableLimit = parseLogLimit(limit, 10);
		this.labelValue = label;
		this.subLabelValue = subLabel;
	}

	line(message: string): void {
		this.writeLines(message.trimEnd());
	}

	log(message: string): void {
		this.line(message);
	}

	label(message: string): void {
		this.labelValue = message;
	}

	subLabel(message: string): void {
		this.subLabelValue = message;
	}

	partial(chunk: string): void {
		this.#partialBuffer += chunk;

		if (this.#partialStartIndex === null) {
			this.#partialStartIndex = this.lines.length;
		}

		this.lines.splice(this.#partialStartIndex);
		this.writeLines(this.#partialBuffer);
		this.#partialStartIndex = Math.min(this.#partialStartIndex, this.lines.length);
	}

	commitPartial(): void {
		this.#partialBuffer = '';
		this.#partialStartIndex = null;
	}

	info(message: string): void {
		this.line(message);
	}

	success(message: string): void {
		this.stable('success', message);
	}

	warning(message: string): void {
		this.stable('warning', message);
	}

	error(message: string): void {
		this.stable('error', message);
	}

	private stable(type: StableMessage['type'], message: string): void {
		this.stableMessages.push({ message, type });

		while (this.stableMessages.length > this.stableLimit) {
			this.stableMessages.shift();
		}
	}

	private writeLines(message: string): void {
		for (const line of message.split(/\r?\n/u).filter((value) => value.length > 0)) {
			this.lines.push(line.replaceAll(cursorReset, '').replaceAll(eraseLine, ''));
		}

		while (this.lines.length > this.limit) {
			this.lines.shift();
		}
	}
}

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
