import { StreamBuffer } from '#tui/status/stream/buffer';
import { StreamLifecycle } from '#tui/status/stream/lifecycle';
import { streamClosedError, streamPromptError } from '#tui/status/stream/output/errors';
import { pipeStreamSource } from '#tui/status/stream/output/pipe';
import { streamBufferLines, streamBufferValue } from '#tui/status/stream/output/readback';
import { flushStreamBuffer, renderStreamBuffer } from '#tui/status/stream/output/rendering';
import { StreamRenderer } from '#tui/status/stream/renderer';

export class Stream {
	readonly #buffer = new StreamBuffer(10);
	readonly #renderer = new StreamRenderer();
	readonly #lifecycle = new StreamLifecycle(() => {
		this.flush();
	});

	write(content: string): this {
		return this.append(content);
	}

	append(content: string): this {
		if (this.#lifecycle.closed()) {
			throw streamClosedError();
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
		return streamBufferLines(this.#buffer);
	}

	async pipe(source: AsyncIterable<string> | Iterable<string>): Promise<void> {
		return pipeStreamSource(
			source,
			(chunk) => {
				this.write(chunk);
			},
			() => {
				this.close();
			},
		);
	}

	prompt(): never {
		throw streamPromptError();
	}

	value(): string {
		return streamBufferValue(this.#buffer);
	}

	private render(): void {
		renderStreamBuffer({ buffer: this.#buffer, renderer: this.#renderer });
	}

	private flush(): void {
		flushStreamBuffer({ buffer: this.#buffer, renderer: this.#renderer });
	}
}
