import { progressStateSnapshot } from '#tui/status/progress/state/snapshot';
import { nextProgressCurrent } from '#tui/status/progress/state/value';
import { parseProgressTotal } from '#tui/status/validators/progress';
import type { ProgressFrameState } from '#tui/status/progress/render';
import type { ProgressStateSnapshot } from '#tui/status/progress/state/snapshot';

export type { ProgressStateSnapshot } from '#tui/status/progress/state/snapshot';

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
		this.#current = nextProgressCurrent(this.#current, this.total, step);
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
		return progressStateSnapshot(
			this.#current,
			this.total,
			this.#label,
			this.#hint,
			this.#state,
		);
	}
}
