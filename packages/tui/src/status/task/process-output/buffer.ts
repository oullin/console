import type { Logger } from '#tui/status/task/logger';

export class ProcessOutputBuffer {
	#pending = '';
	readonly #logger: Logger;

	constructor(logger: Logger) {
		this.#logger = logger;
	}

	write(chunk: string): void {
		const lines = `${this.#pending}${chunk}`.split(/\r?\n/u);

		this.#pending = lines.pop() ?? '';

		for (const line of lines) {
			if (line.length > 0) {
				this.#logger.line(line);
			}
		}
	}

	flush(): void {
		if (this.#pending.length === 0) {
			return;
		}

		this.#logger.line(this.#pending);
		this.#pending = '';
	}
}
