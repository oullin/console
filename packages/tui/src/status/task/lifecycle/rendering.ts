import { promptEnvironment } from '#tui/environment';
import { eraseRenderedFrame } from '#tui/status/frame';
import { renderLoggerTaskFrame } from '#tui/status/task/frame';
import type { Logger } from '#tui/status/task/logger';

type TaskLifecycleRenderOptions = {
	finished?: boolean;
	keepSummary?: boolean;
};

export type TaskLifecycleRenderer = {
	current(): string;
	render(options?: TaskLifecycleRenderOptions): void;
};

export const createTaskLifecycleRenderer = (logger: Logger): TaskLifecycleRenderer => {
	const output = promptEnvironment().output;
	let frame = '';

	return {
		current() {
			return frame;
		},
		render(options = {}) {
			if (frame.length > 0) {
				eraseRenderedFrame(frame);
			}

			frame = renderLoggerTaskFrame(logger, options);
			output.write(frame);
		},
	};
};
