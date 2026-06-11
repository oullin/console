import { parseLogLimit } from '#tui/status/validators/limit';
import { sanitizeTaskLine } from '#tui/status/task/sanitize';
import type { StableTaskMessage } from '#tui/status/task/messages';

export class Logger {
	labelValue: string;
	readonly lines: string[] = [];
	readonly stableMessages: StableTaskMessage[] = [];
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

	private stable(type: StableTaskMessage['type'], message: string): void {
		this.stableMessages.push({ message, type });
		this.lines.splice(0);
		this.#partialBuffer = '';
		this.#partialStartIndex = null;

		while (this.stableMessages.length > this.stableLimit) {
			this.stableMessages.shift();
		}
	}

	private writeLines(message: string): void {
		for (const line of message.split(/\r?\n/u).filter((value) => value.length > 0)) {
			this.lines.push(sanitizeTaskLine(line));
		}

		while (this.lines.length > this.limit) {
			this.lines.shift();
		}
	}
}
