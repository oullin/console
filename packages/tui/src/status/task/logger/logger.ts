import { createTaskLoggerLimits } from '#tui/status/task/logger/limits';
import { appendPartialTaskLog, appendTaskLogLines } from '#tui/status/task/logger/lines';
import { appendStableTaskMessage } from '#tui/status/task/logger/stable';
import type { TaskLoggerLimits } from '#tui/status/task/logger/limits';
import type { PartialTaskLogState } from '#tui/status/task/logger/lines';
import type { StableTaskMessage } from '#tui/status/task/messages';

export class Logger {
	labelValue: string;
	readonly lines: string[] = [];
	readonly stableMessages: StableTaskMessage[] = [];
	subLabelValue: string;
	#partial: PartialTaskLogState = { startIndex: null, value: '' };
	private readonly limits: TaskLoggerLimits;

	constructor(limit: number, label: string, subLabel = '') {
		this.limits = createTaskLoggerLimits(limit);
		this.labelValue = label;
		this.subLabelValue = subLabel;
	}

	get limitValue(): number {
		return this.limits.line;
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
		this.#partial = appendPartialTaskLog(this.lines, this.#partial, chunk, this.limits.line);
	}

	commitPartial(): void {
		this.#partial = { startIndex: null, value: '' };
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

	private stable(type: StableTaskMessage['type'], message: string): void {
		appendStableTaskMessage(this.stableMessages, type, message, this.limits.stable);
		this.lines.splice(0);
		this.commitPartial();
	}

	private writeLines(message: string): void {
		appendTaskLogLines(this.lines, message, this.limits.line);
	}
}
