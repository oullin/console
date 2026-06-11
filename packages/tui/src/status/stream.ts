import { promptEnvironment } from '#tui/environment';
import { StreamBuffer } from '#tui/status/stream/buffer';
import { renderStreamFrame, streamLines } from '#tui/status/stream/render';

export class Stream {
	#closed = false;
	readonly #buffer = new StreamBuffer(10);

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
		while (this.#buffer.flushNext()) {
			this.render();
		}

		this.#closed = true;
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
		promptEnvironment().output.write(renderStreamFrame({ value: this.value() }));
	}
}

export function stream(): Stream;

export function stream(source: AsyncIterable<string> | Iterable<string>): Promise<void>;

export function stream(source?: AsyncIterable<string> | Iterable<string>): Stream | Promise<void> {
	const output = new Stream();

	return source === undefined ? output : output.pipe(source);
}
