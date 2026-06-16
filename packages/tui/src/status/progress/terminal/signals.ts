const progressSignals = ['SIGINT', 'SIGTERM'] as const;

export type ProgressSignalTarget = {
	off(signal: string, listener: () => void): unknown;
	on(signal: string, listener: () => void): unknown;
};

export class ProgressSignalHandlers {
	#attached = false;
	readonly #handleSignal: () => void;
	readonly #target: ProgressSignalTarget;

	constructor(target: ProgressSignalTarget, handleSignal: () => void) {
		this.#target = target;
		this.#handleSignal = handleSignal;
	}

	attach(): void {
		if (this.#attached) {
			return;
		}

		for (const signal of progressSignals) {
			this.#target.on(signal, this.#handleSignal);
		}

		this.#attached = true;
	}

	detach(): void {
		if (!this.#attached) {
			return;
		}

		for (const signal of progressSignals) {
			this.#target.off(signal, this.#handleSignal);
		}

		this.#attached = false;
	}
}
