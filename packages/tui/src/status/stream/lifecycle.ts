import { StatusSignalCleanup } from '#tui/status/signals';
import { hideCursor, showCursor } from '#tui/terminal';

export class StreamLifecycle {
	#closed = false;
	readonly #flush: () => void;
	readonly #signalCleanup: StatusSignalCleanup;

	constructor(flush: () => void) {
		this.#flush = flush;
		this.#signalCleanup = new StatusSignalCleanup(() => {
			this.close();
		});

		hideCursor();
		this.#signalCleanup.attach();
	}

	close(): void {
		if (this.#closed) {
			return;
		}

		try {
			this.#flush();
		} finally {
			this.#closed = true;
			this.#signalCleanup.detach();
			showCursor();
		}
	}

	closed(): boolean {
		return this.#closed;
	}
}
