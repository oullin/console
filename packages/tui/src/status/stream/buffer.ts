export class StreamBuffer {
	readonly fading: string[] = [];
	#message = '';

	constructor(private readonly fadeLimit: number) {}

	append(message: string): void {
		this.fading.push(message);

		while (this.fading.length > this.fadeLimit) {
			this.#message += this.fading.shift() ?? '';
		}
	}

	flushNext(): boolean {
		const next = this.fading.shift();

		if (next === undefined) {
			return false;
		}

		this.#message += next;

		return true;
	}

	value(): string {
		return `${this.#message}${this.fading.join('')}`;
	}

	stableValue(): string {
		return this.#message;
	}
}
