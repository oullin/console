import { promptEnvironment } from '#tui/environment';
import { parseProgressStep, parseProgressTotal } from '#tui/status/validators/progress';
import type { MaybePromise } from '#tui/types';

export class Progress {
	#current = 0;
	#label: string;
	#hint: string;
	readonly total: number;

	constructor(total: number, message = 'Progress', hint = '') {
		this.total = parseProgressTotal(total);
		this.#label = message;
		this.#hint = hint;
	}

	start(): void {
		this.render();
	}

	advance(step = 1): void {
		this.#current = Math.max(0, Math.min(this.total, this.#current + parseProgressStep(step)));
		this.render();
	}

	finish(): void {
		this.#current = this.total;
		this.render();
	}

	label(value: string): this {
		this.#label = value;

		return this;
	}

	hint(value: string): this {
		this.#hint = value;

		return this;
	}

	percentage(): number {
		return this.#current / this.total;
	}

	current(): number {
		return this.#current;
	}

	value(): boolean {
		return true;
	}

	render(): void {
		const width = 20;
		const filled = Math.ceil(width * this.percentage());
		const bar = `${'█'.repeat(filled)}${' '.repeat(width - filled)}`;
		const hint = this.#hint ? ` ${this.#hint}` : '';

		promptEnvironment().output.write(`${this.#label}: ${bar} ${this.#current} / ${this.total}${hint}\n`);
	}
}

export function progress(total: number, message?: string): Progress;

export function progress<T, R>(label: string, steps: Iterable<T> | number, callback?: (step: T | number, progress: Progress) => MaybePromise<R>, hint?: string): Progress | Promise<R[]>;

export function progress<T, R>(
	labelOrTotal: string | number,
	stepsOrMessage?: Iterable<T> | number | string,
	callback?: (step: T | number, progress: Progress) => MaybePromise<R>,
	hint = '',
): Progress | Promise<R[]> {
	if (typeof labelOrTotal === 'number') {
		return new Progress(labelOrTotal, typeof stepsOrMessage === 'string' ? stepsOrMessage : undefined);
	}

	const steps = stepsOrMessage ?? 0;

	if (typeof steps === 'string') {
		throw new Error('Progress steps must be an iterable or a number.');
	}

	const values = typeof steps === 'number' ? Array.from({ length: parseProgressTotal(steps) }, (_, index) => index) : Array.from(steps);
	const bar = new Progress(values.length, labelOrTotal, hint);

	if (!callback) {
		return bar;
	}

	return (async () => {
		const results: R[] = [];

		bar.start();

		for (const value of values) {
			results.push(await callback(value, bar));

			bar.advance();
		}

		bar.finish();

		return results;
	})();
}
