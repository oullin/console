import { resolveSpinnerOptions } from '#tui/status/spinner/options';
import { runSpinnerLifecycle } from '#tui/status/spinner/lifecycle';
import type { MaybePromise, StatusOptions } from '#tui/types';

export function spin<T>(callback: () => MaybePromise<T>, options?: StatusOptions): Promise<T>;

export function spin<T>(message: string, callback: () => MaybePromise<T>): Promise<T>;

export async function spin<T>(callbackOrMessage: (() => MaybePromise<T>) | string, optionsOrCallback: StatusOptions | (() => MaybePromise<T>) = { message: '' }): Promise<T> {
	const options = resolveSpinnerOptions(callbackOrMessage, optionsOrCallback);

	return runSpinnerLifecycle(options.message, options.callback);
}
