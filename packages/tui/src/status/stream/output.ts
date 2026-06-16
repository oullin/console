import { StreamBuffer } from '#tui/status/stream/buffer';
import { StreamLifecycle } from '#tui/status/stream/lifecycle';
import { StreamRenderer } from '#tui/status/stream/renderer';
import { streamLines } from '#tui/status/stream/render';

export class Stream {
	readonly #buffer = new StreamBuffer(10);
	readonly #lifecycle = new StreamLifecycle(() => {
		this.flush();
	});
	readonly #renderer = new StreamRenderer();

	write(content: string): this {
		return this.append(content);
	}

	append(content: string): this {
		if (this.#lifecycle.closed()) {
			throw new Error('Stream is closed.');
		}

		this.#buffer.append(content);
		this.render();

		return this;
	}

	close(): void {
		this.#lifecycle.close();
	}

	closed(): boolean {
		return this.#lifecycle.closed();
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

	private flush(): void {
		while (this.#buffer.flushNext()) {
			this.render();
		}
	}
}
