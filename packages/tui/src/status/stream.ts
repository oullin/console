import { promptEnvironment } from '#tui/environment';

export class Stream {
	#value = '';

	write(content: string): this {
		this.#value += content;
		promptEnvironment().output.write(content);

		return this;
	}

	append(content: string): this {
		return this.write(content);
	}

	close(): void {
		//
	}

	lines(): string[] {
		return this.#value.split(/\r?\n/u);
	}

	async pipe(source: AsyncIterable<string> | Iterable<string>): Promise<void> {
		for await (const chunk of source) {
			this.write(chunk);
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
