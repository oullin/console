import { parseProgressStep, parseProgressTotal } from '#tui/status/validators/progress';
import type { ProgressFrameState } from '#tui/status/progress/render';

export type ProgressStateSnapshot = {
	current: number;
	hint: string;
	label: string;
	state: ProgressFrameState;
	total: number;
};

export class ProgressState {
	#current = 0;
	#hint: string;
	#label: string;
	#state: ProgressFrameState = 'active';
	readonly total: number;

	constructor(total: number, label: string, hint: string) {
		this.total = parseProgressTotal(total);
		this.#label = label;
		this.#hint = hint;
	}

	activate(): void {
		this.#state = 'active';
	}

	advance(step: number): void {
		this.#state = 'active';
		this.#current = this.#current + parseProgressStep(step);
		this.#current = Math.max(0, Math.min(this.#current, this.total));
	}

	fail(): void {
		this.#state = 'error';
	}

	finish(): void {
		this.#state = 'submit';
	}

	hint(value: string): void {
		this.#hint = value;
	}

	label(value: string): void {
		this.#label = value;
	}

	current(): number {
		return this.#current;
	}

	percentage(): number {
		return this.#current / this.total;
	}

	snapshot(): ProgressStateSnapshot {
		return {
			current: this.#current,
			hint: this.#hint,
			label: this.#label,
			state: this.#state,
			total: this.total,
		};
	}
}
