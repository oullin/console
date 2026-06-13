import { promptEnvironment } from '#tui/environment';
import { eraseRenderedFrame } from '#tui/status/frame';
import { StatusSignalCleanup } from '#tui/status/signals';
import { renderSpinnerFrame } from '#tui/status/spinner/render';
import { hideCursor, showCursor } from '#tui/terminal';
import type { MaybePromise, StatusOptions } from '#tui/types';

export function spin<T>(callback: () => MaybePromise<T>, options?: StatusOptions): Promise<T>;

export function spin<T>(message: string, callback: () => MaybePromise<T>): Promise<T>;

export async function spin<T>(callbackOrMessage: (() => MaybePromise<T>) | string, optionsOrCallback: StatusOptions | (() => MaybePromise<T>) = { message: '' }): Promise<T> {
	const callback = typeof callbackOrMessage === 'string' ? optionsOrCallback : callbackOrMessage;
	const options = typeof callbackOrMessage === 'string' ? { message: callbackOrMessage } : optionsOrCallback;

	if (typeof callback !== 'function') {
		throw new Error('A spinner callback is required.');
	}

	const message = typeof options === 'function' ? '' : options.message;
	const output = promptEnvironment().output;
	const frame = renderSpinnerFrame(message);

	const cleanup = new StatusSignalCleanup(() => {
		eraseRenderedFrame(frame);
		showCursor();
	});

	hideCursor();
	cleanup.attach();
	output.write(frame);

	try {
		return await callback();
	} finally {
		cleanup.restore();
	}
}
