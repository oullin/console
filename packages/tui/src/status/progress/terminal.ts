import { eraseRenderedFrame } from '#tui/status/frame';
import { hideCursor, showCursor } from '#tui/terminal';

const progressSignals = ['SIGINT', 'SIGTERM'] as const;

export type ProgressSignalTarget = {
	off(signal: string, listener: () => void): unknown;
	on(signal: string, listener: () => void): unknown;
};

export class ProgressTerminalLifecycle {
	#cursorHidden = false;
	#renderedFrame: string | null = null;
	#signalsAttached = false;
	readonly #handleSignal: () => void;
	readonly #signalTarget: ProgressSignalTarget;

	constructor(signalTarget: ProgressSignalTarget, handleSignal: () => void) {
		this.#signalTarget = signalTarget;
		this.#handleSignal = handleSignal;
	}

	beginRender(): void {
		if (!this.#cursorHidden) {
			hideCursor();
			this.#cursorHidden = true;
			this.#attachSignalHandlers();
		}

		if (this.#renderedFrame) {
			eraseRenderedFrame(this.#renderedFrame);
		}
	}

	commitFrame(frame: string): void {
		this.#renderedFrame = frame;
	}

	restore(): void {
		if (this.#renderedFrame) {
			eraseRenderedFrame(this.#renderedFrame);
			this.#renderedFrame = null;
		}

		if (this.#cursorHidden) {
			showCursor();
			this.#cursorHidden = false;
		}

		this.#detachSignalHandlers();
	}

	#attachSignalHandlers(): void {
		if (this.#signalsAttached) {
			return;
		}

		for (const signal of progressSignals) {
			this.#signalTarget.on(signal, this.#handleSignal);
		}

		this.#signalsAttached = true;
	}

	#detachSignalHandlers(): void {
		if (!this.#signalsAttached) {
			return;
		}

		for (const signal of progressSignals) {
			this.#signalTarget.off(signal, this.#handleSignal);
		}

		this.#signalsAttached = false;
	}
}
