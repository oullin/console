import { ProgressController } from '#tui/status/progress/controller';
import { progressPromptError } from '#tui/status/progress/prompt';
import type { ProgressSignalTarget } from '#tui/status/progress/terminal';

export type { ProgressSignalTarget } from '#tui/status/progress/terminal';

export class Progress {
	readonly #controller: ProgressController;
	readonly total: number;
	#handleSignal = (): void => {
		this.fail();
	};

	constructor(total: number, message = 'Progress', hint = '', signalTarget: ProgressSignalTarget = process) {
		this.#controller = new ProgressController(total, message, hint, signalTarget, this.#handleSignal);
		this.total = this.#controller.state.total;
	}

	start(): void {
		this.#controller.activate();
	}

	advance(step = 1): void {
		this.#controller.advance(step);
	}

	finish(): void {
		this.#controller.finish();
	}

	fail(): void {
		this.#controller.fail();
	}

	label(value: string): this {
		this.#controller.state.label(value);

		return this;
	}

	hint(value: string): this {
		this.#controller.state.hint(value);

		return this;
	}

	percentage(): number {
		return this.#controller.state.percentage();
	}

	current(): number {
		return this.#controller.state.current();
	}

	value(): boolean {
		return true;
	}

	prompt(): never {
		throw progressPromptError();
	}

	render(): void {
		this.#controller.render();
	}
}
