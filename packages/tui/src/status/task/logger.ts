import { parseLogLimit } from '#tui/status/validators/limit';
import { appendPartialTaskLog, appendTaskLogLines } from '#tui/status/task/logger/lines';
import { appendStableTaskMessage } from '#tui/status/task/logger/stable';
import type { PartialTaskLogState } from '#tui/status/task/logger/lines';
import type { StableTaskMessage } from '#tui/status/task/messages';

export class Logger {
	labelValue: string;
	readonly lines: string[] = [];
	readonly stableMessages: StableTaskMessage[] = [];
	subLabelValue: string;
	#partial: PartialTaskLogState = { startIndex: null, value: '' };
	private readonly limit: number;
	private readonly stableLimit: number;

	constructor(limit: number, label: string, subLabel = '') {
		this.limit = parseLogLimit(limit, 10);
		this.stableLimit = parseLogLimit(limit, 10);
		this.labelValue = label;
		this.subLabelValue = subLabel;
	}

	get limitValue(): number {
		return this.limit;
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
		this.#partial = appendPartialTaskLog(this.lines, this.#partial, chunk, this.limit);
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
		appendStableTaskMessage(this.stableMessages, type, message, this.stableLimit);
		this.lines.splice(0);
		this.commitPartial();
	}

	private writeLines(message: string): void {
		appendTaskLogLines(this.lines, message, this.limit);
	}
}
