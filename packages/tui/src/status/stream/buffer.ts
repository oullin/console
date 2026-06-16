import { parseStreamFadeSteps } from '#tui/status/stream/validators/fade';

export class StreamBuffer {
	readonly fading: string[] = [];
	readonly #fadeLimit: number;
	#message = '';

	constructor(fadeLimit: number) {
		this.#fadeLimit = parseStreamFadeSteps(fadeLimit, 10);
	}

	append(message: string): void {
		this.fading.push(message);

		while (this.fading.length > this.#fadeLimit) {
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
