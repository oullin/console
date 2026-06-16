import { resolveTaskDefinition } from '#tui/status/task/definition';
import { runTaskLifecycle } from '#tui/status/task/lifecycle';
import { Logger } from '#tui/status/task/logger';
import type { TaskDefinition } from '#tui/status/task/definition';
import type { MaybePromise } from '#tui/types';

export { Logger };
export type { TaskDefinition } from '#tui/status/task/definition';

export async function task<T>(definition: TaskDefinition<T>): Promise<T>;

export async function task<T>(label: string, callback: (logger: Logger) => MaybePromise<T>, limit?: number, keepSummary?: boolean, subLabel?: string): Promise<T>;

export async function task<T>(definitionOrLabel: TaskDefinition<T> | string, callback?: (logger: Logger) => MaybePromise<T>, limit = 10, keepSummary = false, subLabel?: string): Promise<T> {
	return runTaskLifecycle(resolveTaskDefinition(definitionOrLabel, callback, limit, keepSummary, subLabel));
}
