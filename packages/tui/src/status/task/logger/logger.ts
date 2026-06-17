import { createTaskLoggerLimits } from '#tui/status/task/logger/limits';
import { createTaskLoggerLabels } from '#tui/status/task/logger/labels';
import { notifyTaskLoggerChanged } from '#tui/status/task/logger/events';
import { syncTaskLoggerLabel, syncTaskLoggerSubLabel } from '#tui/status/task/logger/sync';
import type { TaskLoggerChangeHandler } from '#tui/status/task/logger/events';
import type { TaskLoggerLimits } from '#tui/status/task/logger/limits';
import type { PartialTaskLogState } from '#tui/status/task/logger/lines';
import type { TaskLoggerLabels } from '#tui/status/task/logger/labels';
import type { StableTaskMessage } from '#tui/status/task/messages';

import { clearTaskLoggerPartial, writeStableTaskLoggerMessage, writeTaskLoggerLine, writeTaskLoggerPartial } from '#tui/status/task/logger/methods';

export class Logger {
	labelValue: string;
	readonly lines: string[] = [];
	readonly stableMessages: StableTaskMessage[] = [];
	subLabelValue: string;
	#partial: PartialTaskLogState = { startIndex: null, value: '' };
	private labels: TaskLoggerLabels;
	private readonly limits: TaskLoggerLimits;

	constructor(
		limit: number,
		label: string,
		subLabel = '',
		private readonly onChange?: TaskLoggerChangeHandler,
	) {
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
		this.changed();
	}

	log(message: string): void {
		this.line(message);
	}

	label(message: string): void {
		const next = syncTaskLoggerLabel(this.labels, message);

		this.labels = next.labels;
		this.labelValue = next.labelValue;
		this.changed();
	}

	subLabel(message: string): void {
		const next = syncTaskLoggerSubLabel(this.labels, message);

		this.labels = next.labels;
		this.subLabelValue = next.subLabelValue;
		this.changed();
	}

	partial(chunk: string): void {
		this.#partial = writeTaskLoggerPartial(this.lines, this.#partial, chunk, this.limits.line);
		this.changed();
	}

	commitPartial(): void {
		this.#partial = clearTaskLoggerPartial();
		this.changed();
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
		this.changed();
	}

	private changed(): void {
		notifyTaskLoggerChanged(this.onChange);
	}
}
