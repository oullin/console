import { promptEnvironment } from '#tui/environment';
import { eraseRenderedFrame } from '#tui/status/frame';
import { parseProgressStep, parseProgressTotal } from '#tui/status/validators/progress';
import { renderProgressFrame } from '#tui/status/progress/render';
import { runProgressSteps } from '#tui/status/progress/run';
import { progressValues } from '#tui/status/progress/steps';
import { hideCursor, showCursor } from '#tui/terminal';
import type { ProgressFrameState } from '#tui/status/progress/render';
import type { MaybePromise } from '#tui/types';

const progressSignals = ['SIGINT', 'SIGTERM'] as const;

type ProgressSignalTarget = {
	off(signal: string, listener: () => void): unknown;
	on(signal: string, listener: () => void): unknown;
};

export class Progress {
	#current = 0;
	#label: string;
	#hint: string;
	#state: ProgressFrameState = 'active';
	#renderedFrame: string | null = null;
	#cursorHidden = false;
	#signalsAttached = false;
	readonly #signalTarget: ProgressSignalTarget;
	readonly total: number;
	#handleSignal = (): void => {
		this.fail();
	};

	constructor(total: number, message = 'Progress', hint = '', signalTarget: ProgressSignalTarget = process) {
		this.total = parseProgressTotal(total);
		this.#label = message;
		this.#hint = hint;
		this.#signalTarget = signalTarget;
	}

	start(): void {
		this.#state = 'active';
		this.render();
	}

	advance(step = 1): void {
		this.#state = 'active';
		this.#current = this.#current + parseProgressStep(step);

		if (this.#current > this.total) {
			this.#current = this.total;
		}

		this.render();
	}

	finish(): void {
		this.#state = 'submit';
		this.render();
		this.#restoreTerminal();
	}

	fail(): void {
		this.#state = 'error';
		this.render();
		this.#restoreTerminal();
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

		if (!this.#cursorHidden) {
			hideCursor();
			this.#cursorHidden = true;
			this.#attachSignalHandlers();
		}

		if (this.#renderedFrame) {
			eraseRenderedFrame(this.#renderedFrame);
		}

		promptEnvironment().output.write(frame);
		this.#renderedFrame = frame;
	}

	#restoreTerminal(): void {
		if (this.#renderedFrame) {
			eraseRenderedFrame(this.#renderedFrame);
			this.#renderedFrame = null;
		}

		if (this.#cursorHidden) {
			showCursor();
			this.#cursorHidden = false;
		}

		this.#detachSignalHandlers();
	}

	#attachSignalHandlers(): void {
		if (this.#signalsAttached) {
			return;
		}

		for (const signal of progressSignals) {
			this.#signalTarget.on(signal, this.#handleSignal);
		}

		this.#signalsAttached = true;
	}

	#detachSignalHandlers(): void {
		if (!this.#signalsAttached) {
			return;
		}

		for (const signal of progressSignals) {
			this.#signalTarget.off(signal, this.#handleSignal);
		}

		this.#signalsAttached = false;
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

	const values = progressValues(steps);
	const bar = new Progress(values.length, labelOrTotal, hint);

	if (!callback) {
		return bar;
	}

	return runProgressSteps(bar, values, callback);
}
