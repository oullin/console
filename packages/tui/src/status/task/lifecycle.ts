import { eraseRenderedFrame } from '#tui/status/frame';
import { StatusSignalCleanup } from '#tui/status/signals';
import { Logger } from '#tui/status/task/logger';
import { captureTaskProcessOutput } from '#tui/status/task/process-output';
import { createTaskLifecycleRenderer } from '#tui/status/task/lifecycle/rendering';
import { hideCursor, showCursor } from '#tui/terminal';
import type { ResolvedTaskDefinition } from '#tui/status/task/definition';
import type { TaskLifecycleRenderer } from '#tui/status/task/lifecycle/rendering';

export const runTaskLifecycle = async <T>(definition: ResolvedTaskDefinition<T>): Promise<T> => {
	let renderer: TaskLifecycleRenderer | null = null;
	const logger = new Logger(definition.limit, definition.title, definition.subLabel, () => {
		renderer?.render();
	});

	hideCursor();

	renderer = createTaskLifecycleRenderer(logger);
	renderer.render();

	const processOutput = captureTaskProcessOutput(logger);

	const cleanup = new StatusSignalCleanup(() => {
		processOutput.stop();
		eraseRenderedFrame(renderer?.current() ?? '');
		showCursor();
	}).attach();

	try {
		const result = await definition.run(logger);

		processOutput.stop();
		renderer.render({ finished: true, keepSummary: definition.keepSummary });

		return result;
	} catch (error) {
		processOutput.stop();
		renderer.render();

		throw error;
	} finally {
		cleanup.detach();
		showCursor();
	}
};
