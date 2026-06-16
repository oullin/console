import { promptEnvironment } from '#tui/environment';
import { renderProgressFrame } from '#tui/status/progress/render';
import { ProgressTerminalLifecycle } from '#tui/status/progress/terminal';
import { parseProgressStep, parseProgressTotal } from '#tui/status/validators/progress';
import type { ProgressFrameState } from '#tui/status/progress/render';
import type { ProgressSignalTarget } from '#tui/status/progress/terminal';

export type { ProgressSignalTarget } from '#tui/status/progress/terminal';

export class Progress {
	#current = 0;
	#label: string;
	#hint: string;
	#state: ProgressFrameState = 'active';
	readonly #terminal: ProgressTerminalLifecycle;
	readonly total: number;
	#handleSignal = (): void => {
		this.fail();
	};

	constructor(total: number, message = 'Progress', hint = '', signalTarget: ProgressSignalTarget = process) {
		this.total = parseProgressTotal(total);
		this.#label = message;
		this.#hint = hint;
		this.#terminal = new ProgressTerminalLifecycle(signalTarget, this.#handleSignal);
	}

	start(): void {
		this.#state = 'active';
		this.render();
	}

	advance(step = 1): void {
		this.#state = 'active';
		this.#current = this.#current + parseProgressStep(step);

		if (this.#current < 0) {
			this.#current = 0;
		}

		if (this.#current > this.total) {
			this.#current = this.total;
		}

		this.render();
	}

	finish(): void {
		this.#state = 'submit';
		this.render();
		this.#terminal.restore();
	}

	fail(): void {
		this.#state = 'error';
		this.render();
		this.#terminal.restore();
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

	prompt(): never {
		throw new Error('Progress Bar cannot be prompted.');
	}

	render(): void {
		const frame = renderProgressFrame({ current: this.#current, hint: this.#hint, label: this.#label, state: this.#state, total: this.total });

		this.#terminal.beginRender();
		promptEnvironment().output.write(frame);
		this.#terminal.commitFrame(frame);
	}
}
