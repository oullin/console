import { promptEnvironment } from '#tui/environment';
import { eraseRenderedFrame } from '#tui/status/frame';
import { StatusSignalCleanup } from '#tui/status/signals';
import { renderSpinnerFrame } from '#tui/status/spinner/render';
import { hideCursor, showCursor } from '#tui/terminal';
import type { MaybePromise } from '#tui/types';

export const runSpinnerLifecycle = async <T>(message: string, callback: () => MaybePromise<T>): Promise<T> => {
	const frame = renderSpinnerFrame(message);

	let rendered = false;

	const cleanup = new StatusSignalCleanup(() => {
		try {
			if (rendered) {
				eraseRenderedFrame(frame);
			}
		} finally {
			showCursor();
		}
	});

	try {
		hideCursor();
		cleanup.attach();
		promptEnvironment().output.write(frame);
		rendered = true;
	} catch (error) {
		cleanup.detach();
		showCursor();

		throw error;
	}

	try {
		return await callback();
	} finally {
		cleanup.restore();
	}
};
