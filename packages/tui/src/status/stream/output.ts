import { StatusSignalCleanup } from '#tui/status/signals';
import { StreamBuffer } from '#tui/status/stream/buffer';
import { StreamRenderer } from '#tui/status/stream/renderer';
import { streamLines } from '#tui/status/stream/render';
import { hideCursor, showCursor } from '#tui/terminal';

export class Stream {
	#closed = false;
	readonly #buffer = new StreamBuffer(10);
	readonly #renderer = new StreamRenderer();
	readonly #signalCleanup = new StatusSignalCleanup(() => {
		this.close();
	});

	constructor() {
		hideCursor();
		this.#signalCleanup.attach();
	}

	write(content: string): this {
		return this.append(content);
	}

	append(content: string): this {
		if (this.#closed) {
			throw new Error('Stream is closed.');
		}

		this.#buffer.append(content);
		this.render();

		return this;
	}

	close(): void {
		if (this.#closed) {
			return;
		}

		while (this.#buffer.flushNext()) {
			this.render();
		}

		this.#closed = true;
		this.#signalCleanup.detach();
		showCursor();
	}

	closed(): boolean {
		return this.#closed;
	}

	lines(): string[] {
		return streamLines({ value: this.value() });
	}

	async pipe(source: AsyncIterable<string> | Iterable<string>): Promise<void> {
		try {
			for await (const chunk of source) {
				this.write(chunk);
			}
		} finally {
			this.close();
		}
	}

	prompt(): never {
		throw new Error('Stream cannot be prompted');
	}

	value(): string {
		return this.#buffer.value();
	}

	private render(): void {
		this.#renderer.render({
			fading: this.#buffer.fading,
			value: this.#buffer.stableValue(),
		});
	}
}
