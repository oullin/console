import { ProgressRenderer } from '#tui/status/progress/renderer';
import { ProgressState } from '#tui/status/progress/state';
import { ProgressTerminalLifecycle } from '#tui/status/progress/terminal';
import type { ProgressSignalTarget } from '#tui/status/progress/terminal';

export type { ProgressSignalTarget } from '#tui/status/progress/terminal';

export class Progress {
	readonly #state: ProgressState;
	readonly #renderer: ProgressRenderer;
	readonly #terminal: ProgressTerminalLifecycle;
	readonly total: number;
	#handleSignal = (): void => {
		this.fail();
	};

	constructor(total: number, message = 'Progress', hint = '', signalTarget: ProgressSignalTarget = process) {
		this.#state = new ProgressState(total, message, hint);
		this.total = this.#state.total;
		this.#terminal = new ProgressTerminalLifecycle(signalTarget, this.#handleSignal);
		this.#renderer = new ProgressRenderer(this.#terminal);
	}

	start(): void {
		this.#state.activate();
		this.render();
	}

	advance(step = 1): void {
		this.#state.advance(step);
		this.render();
	}

	finish(): void {
		this.#state.finish();
		this.render();
		this.#terminal.restore();
	}

	fail(): void {
		this.#state.fail();
		this.render();
		this.#terminal.restore();
	}

	label(value: string): this {
		this.#state.label(value);

		return this;
	}

	hint(value: string): this {
		this.#state.hint(value);

		return this;
	}

	percentage(): number {
		return this.#state.percentage();
	}

	current(): number {
		return this.#state.current();
	}

	value(): boolean {
		return true;
	}

	prompt(): never {
		throw new Error('Progress Bar cannot be prompted.');
	}

	render(): void {
		this.#renderer.render(this.#state.snapshot());
	}
}
