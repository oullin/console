import { setTaskLoggerLabel, setTaskLoggerSubLabel } from '#tui/status/task/logger/labels';
import type { TaskLoggerLabels } from '#tui/status/task/logger/labels';

export type TaskLoggerLabelSync = {
	labelValue: string;
	labels: TaskLoggerLabels;
};

export type TaskLoggerSubLabelSync = {
	labels: TaskLoggerLabels;
	subLabelValue: string;
};

export const syncTaskLoggerLabel = (labels: TaskLoggerLabels, label: string): TaskLoggerLabelSync => {
	const next = setTaskLoggerLabel(labels, label);

	return {
		labelValue: next.label,
		labels: next,
	};
};

export const syncTaskLoggerSubLabel = (labels: TaskLoggerLabels, subLabel: string): TaskLoggerSubLabelSync => {
	const next = setTaskLoggerSubLabel(labels, subLabel);

	return {
		labels: next,
		subLabelValue: next.subLabel,
	};
};
