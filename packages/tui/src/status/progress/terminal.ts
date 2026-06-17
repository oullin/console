import { eraseRenderedFrame } from '#tui/status/frame';
import { ProgressSignalHandlers } from '#tui/status/progress/terminal/signals';
import { hideCursor, showCursor } from '#tui/terminal';
import type { ProgressSignalTarget } from '#tui/status/progress/terminal/signals';

export type { ProgressSignalTarget } from '#tui/status/progress/terminal/signals';

export class ProgressTerminalLifecycle {
	#cursorHidden = false;
	#renderedFrame: string | null = null;
	readonly #signals: ProgressSignalHandlers;

	constructor(signalTarget: ProgressSignalTarget, handleSignal: () => void) {
		this.#signals = new ProgressSignalHandlers(signalTarget, handleSignal);
	}

	beginRender(): void {
		if (!this.#cursorHidden) {
			try {
				hideCursor();
				this.#signals.attach();
				this.#cursorHidden = true;
			} catch (error) {
				showCursor();

				throw error;
			}
		}

		if (this.#renderedFrame) {
			eraseRenderedFrame(this.#renderedFrame);
			this.#renderedFrame = null;
		}
	}

	commitFrame(frame: string): void {
		this.#renderedFrame = frame;
	}

	restore(): void {
		try {
			if (this.#renderedFrame) {
				eraseRenderedFrame(this.#renderedFrame);
				this.#renderedFrame = null;
			}
		} finally {
			if (this.#cursorHidden) {
				showCursor();
				this.#cursorHidden = false;
			}

			this.#signals.detach();
		}
	}
}
