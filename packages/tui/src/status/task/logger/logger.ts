import { createTaskLoggerLimits } from '#tui/status/task/logger/limits';
import { createTaskLoggerLabels, setTaskLoggerLabel, setTaskLoggerSubLabel } from '#tui/status/task/logger/labels';
import {
	clearTaskLoggerPartial,
	writeStableTaskLoggerMessage,
	writeTaskLoggerLine,
	writeTaskLoggerPartial,
} from '#tui/status/task/logger/methods';
import type { TaskLoggerLimits } from '#tui/status/task/logger/limits';
import type { PartialTaskLogState } from '#tui/status/task/logger/lines';
import type { TaskLoggerLabels } from '#tui/status/task/logger/labels';
import type { StableTaskMessage } from '#tui/status/task/messages';

export class Logger {
	labelValue: string;
	readonly lines: string[] = [];
	readonly stableMessages: StableTaskMessage[] = [];
	subLabelValue: string;
	#partial: PartialTaskLogState = { startIndex: null, value: '' };
	private labels: TaskLoggerLabels;
	private readonly limits: TaskLoggerLimits;

	constructor(limit: number, label: string, subLabel = '') {
		this.limits = createTaskLoggerLimits(limit);
		this.labels = createTaskLoggerLabels(label, subLabel);
		this.labelValue = this.labels.label;
		this.subLabelValue = this.labels.subLabel;
	}

	get limitValue(): number {
		return this.limits.line;
	}

	line(message: string): void {
		writeTaskLoggerLine(this.lines, message, this.limits.line);
	}

	log(message: string): void {
		this.line(message);
	}

	label(message: string): void {
		this.labels = setTaskLoggerLabel(this.labels, message);
		this.labelValue = this.labels.label;
	}

	subLabel(message: string): void {
		this.labels = setTaskLoggerSubLabel(this.labels, message);
		this.subLabelValue = this.labels.subLabel;
	}

	partial(chunk: string): void {
		this.#partial = writeTaskLoggerPartial(this.lines, this.#partial, chunk, this.limits.line);
	}

	commitPartial(): void {
		this.#partial = clearTaskLoggerPartial();
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
		this.#partial = writeStableTaskLoggerMessage(this.stableMessages, this.lines, type, message, this.limits);
	}
}
