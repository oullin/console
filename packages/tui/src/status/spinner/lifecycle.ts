import { promptEnvironment } from '#tui/environment';
import { eraseRenderedFrame } from '#tui/status/frame';
import { StatusSignalCleanup } from '#tui/status/signals';
import { renderSpinnerFrame } from '#tui/status/spinner/render';
import { hideCursor, showCursor } from '#tui/terminal';
import type { MaybePromise } from '#tui/types';

export const runSpinnerLifecycle = async <T>(message: string, callback: () => MaybePromise<T>): Promise<T> => {
	const frame = renderSpinnerFrame(message);
	const cleanup = new StatusSignalCleanup(() => {
		eraseRenderedFrame(frame);
		showCursor();
	});

	hideCursor();
	cleanup.attach();
	promptEnvironment().output.write(frame);

	try {
		return await callback();
	} finally {
		cleanup.restore();
	}
};
