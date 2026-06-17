import { promptEnvironment } from '#tui/environment';
import { renderProgressFrame } from '#tui/status/progress/render';
import type { ProgressStateSnapshot } from '#tui/status/progress/state';
import type { ProgressTerminalLifecycle } from '#tui/status/progress/terminal';

export class ProgressRenderer {
	constructor(private readonly terminal: ProgressTerminalLifecycle) {}

	render(snapshot: ProgressStateSnapshot): void {
		const frame = renderProgressFrame(snapshot);

		this.terminal.beginRender();
		promptEnvironment().output.write(frame);
		this.terminal.commitFrame(frame);
	}
}
