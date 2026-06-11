import { promptEnvironment } from '#tui/environment';
import type { MaybePromise, StatusOptions } from '#tui/types';

export function spin<T>(callback: () => MaybePromise<T>, options?: StatusOptions): Promise<T>;

export function spin<T>(message: string, callback: () => MaybePromise<T>): Promise<T>;

export async function spin<T>(callbackOrMessage: (() => MaybePromise<T>) | string, optionsOrCallback: StatusOptions | (() => MaybePromise<T>) = { message: 'Loading' }): Promise<T> {
	const callback = typeof callbackOrMessage === 'string' ? optionsOrCallback : callbackOrMessage;
	const options = typeof callbackOrMessage === 'string' ? { message: callbackOrMessage } : optionsOrCallback;

	if (typeof callback !== 'function') {
		throw new Error('A spinner callback is required.');
	}

	const message = typeof options === 'function' ? 'Loading' : options.message;

	promptEnvironment().output.write(`${message}...\n`);

	try {
		const result = await callback();

		promptEnvironment().output.write(`Done: ${message}\n`);

		return result;
	} catch (error) {
		promptEnvironment().error.write(`Failed: ${message}\n`);
		throw error;
	}
}
