import { task } from '#tui/status';
import { isStatusLabel, parseStatusLabel } from '#tui/form/builder/validators/status';
import { parseTaskCallback } from '#tui/status/task/validators/definition';
import type { FormBuilder } from '#tui/form/builder/index';
import type { MaybePromise } from '#tui/types';
import type { Logger, TaskDefinition } from '#tui/status';

export function taskFormStep<T>(this: FormBuilder, definition: TaskDefinition<T>, name?: string): FormBuilder;

export function taskFormStep<T>(this: FormBuilder, label: string, callback: (logger: Logger) => MaybePromise<T>, limit?: number, keepSummary?: boolean, subLabel?: string, name?: string): FormBuilder;

export function taskFormStep<T>(
	this: FormBuilder,
	definitionOrLabel: TaskDefinition<T> | string,
	callbackOrName?: ((logger: Logger) => MaybePromise<T>) | string,
	limit = 10,
	keepSummary = false,
	subLabel = '',
	name?: string,
): FormBuilder {
	if (isStatusLabel(definitionOrLabel)) {
		return this.add(() => task(definitionOrLabel, parseTaskCallback<T>(callbackOrName), limit, keepSummary, subLabel), name);
	}

	return this.add(() => task(definitionOrLabel), parseStatusLabel(callbackOrName));
}
