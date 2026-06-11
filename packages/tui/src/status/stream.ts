import { promptEnvironment } from '#tui/environment';

export class Stream {
	#closed = false;
	#value = '';

	write(content: string): this {
		if (this.#closed) {
			throw new Error('Stream is closed.');
		}

		this.#value += content;
		promptEnvironment().output.write(content);

		return this;
	}

	append(content: string): this {
		return this.write(content);
	}

	close(): void {
		this.#closed = true;
	}

	closed(): boolean {
		return this.#closed;
	}

	lines(): string[] {
		return this.#value.split(/\r?\n/u);
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
		return this.#value;
	}
}

export function stream(): Stream;

export function stream(source: AsyncIterable<string> | Iterable<string>): Promise<void>;

export function stream(source?: AsyncIterable<string> | Iterable<string>): Stream | Promise<void> {
	const output = new Stream();

	return source === undefined ? output : output.pipe(source);
}
