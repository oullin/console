import { createStreamOutputContext } from '#tui/status/stream/output/context';
import { streamClosedError, streamPromptError } from '#tui/status/stream/output/errors';
import { pipeStreamSource } from '#tui/status/stream/output/pipe';
import { streamBufferLines, streamBufferValue } from '#tui/status/stream/output/readback';
import { flushStreamBuffer, renderStreamBuffer } from '#tui/status/stream/output/rendering';
import type { StreamOutputContext } from '#tui/status/stream/output/context';

export class Stream {
	readonly #context: StreamOutputContext = createStreamOutputContext(() => {
		this.flush();
	});

	write(content: string): this {
		return this.append(content);
	}

	append(content: string): this {
		if (this.#context.lifecycle.closed()) {
			throw streamClosedError();
		}

		this.#context.buffer.append(content);
		this.render();

		return this;
	}

	close(): void {
		this.#context.lifecycle.close();
	}

	closed(): boolean {
		return this.#context.lifecycle.closed();
	}

	lines(): string[] {
		return streamBufferLines(this.#context.buffer);
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
		return streamBufferValue(this.#context.buffer);
	}

	private render(): void {
		renderStreamBuffer(this.#context);
	}

	private flush(): void {
		flushStreamBuffer(this.#context);
	}
}
