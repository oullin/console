import { createStreamOutputContext } from '#tui/status/stream/output/context';
import { streamClosedError, streamPromptError } from '#tui/status/stream/output/errors';
import { pipeStreamSource } from '#tui/status/stream/output/pipe';
import { streamBufferLines, streamBufferValue } from '#tui/status/stream/output/readback';
import { flushStreamBuffer, renderStreamBuffer, requestStreamBufferRender } from '#tui/status/stream/output/rendering';
import { parseStreamChunk } from '#tui/status/stream/validators/chunk';
import type { StreamOutputContext } from '#tui/status/stream/output/context';

export class Stream {
	readonly #context: StreamOutputContext = createStreamOutputContext(() => {
		this.flush();
	});

	write(content: string): this {
		return this.append(content);
	}

	append(content: string): this {
		this.appendChunk(content, false);

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
				this.appendChunk(chunk, true);
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

	private appendChunk(content: string, deferred: boolean): void {
		if (this.#context.lifecycle.closed()) {
			throw streamClosedError();
		}

		this.#context.buffer.append(parseStreamChunk(content));
		this.render(deferred);
	}

	private render(deferred: boolean): void {
		if (deferred) {
			requestStreamBufferRender(this.#context);

			return;
		}

		renderStreamBuffer(this.#context);
	}

	private flush(): void {
		flushStreamBuffer(this.#context);
	}
}
