import { createFormResponses } from '#tui/form/builder/responses';
import { sideEffectStep } from '#tui/form/builder/step';
import { submitFormSteps } from '#tui/form/builder/submit';
import { applyFormBuilderMethods, FormBuilderMethodSurface } from '#tui/form/builder/methods';
import type { FormResponses, FormStep, FormStepCondition } from '#tui/form/types';
import type { MaybePromise } from '#tui/types';

export class FormBuilder extends FormBuilderMethodSurface {
	readonly #steps: FormStep[] = [];
	readonly #responses: FormResponses = createFormResponses();

	constructor() {
		super();
		applyFormBuilderMethods(this);
	}

	add(step: (responses: FormResponses, previous: unknown, name?: string) => MaybePromise<unknown>, name?: string, ignoreWhenReverting = false): this {
		this.#steps.push({
			condition: true,
			ignoreWhenReverting,
			name,
			run: step,
		});

		return this;
	}

	addIf(condition: FormStepCondition, step: (responses: FormResponses, previous: unknown, name?: string) => MaybePromise<unknown>, name?: string, ignoreWhenReverting = false): this {
		this.#steps.push({
			condition,
			ignoreWhenReverting,
			name,
			run: step,
		});

		return this;
	}

	addSideEffect(step: () => MaybePromise<void>, name?: string): this {
		return this.add(sideEffectStep(step), name, true);
	}

	addSideEffectIf(condition: FormStepCondition, step: () => MaybePromise<void>, name?: string): this {
		return this.addIf(condition, sideEffectStep(step), name, true);
	}

	async submit(): Promise<FormResponses> {
		return submitFormSteps(this.#steps, this.#responses);
	}
}
