import { promptEnvironment } from '#tui/environment';

export class Stream {
	write(content: string): this {
		promptEnvironment().output.write(content);

		return this;
	}

	async pipe(source: AsyncIterable<string> | Iterable<string>): Promise<void> {
		for await (const chunk of source) {
			this.write(chunk);
		}
	}
}

export function stream(): Stream;

export function stream(source: AsyncIterable<string> | Iterable<string>): Promise<void>;

export function stream(source?: AsyncIterable<string> | Iterable<string>): Stream | Promise<void> {
	const output = new Stream();

	return source === undefined ? output : output.pipe(source);
}
