import { outputBuilderMethods } from '#tui/form/builder/output';
import { promptBuilderMethods } from '#tui/form/builder/prompts';
import { statusBuilderMethods } from '#tui/form/builder/status';
import type { FormResponses, FormStep } from '#tui/form/types';
import type { MaybePromise } from '#tui/types';

export class FormBuilder {
	readonly #steps: FormStep[] = [];
	readonly #responses: FormResponses = [] as unknown as FormResponses;
	readonly alert = outputBuilderMethods.alert;
	readonly autocomplete = promptBuilderMethods.autocomplete;
	readonly confirm = promptBuilderMethods.confirm;
	readonly datatable = outputBuilderMethods.datatable;
	readonly error = outputBuilderMethods.error;
	readonly info = outputBuilderMethods.info;
	readonly intro = outputBuilderMethods.intro;
	readonly multisearch = promptBuilderMethods.multisearch;
	readonly multiselect = promptBuilderMethods.multiselect;
	readonly note = outputBuilderMethods.note;
	readonly number = promptBuilderMethods.number;
	readonly outro = outputBuilderMethods.outro;
	readonly password = promptBuilderMethods.password;
	readonly pause = promptBuilderMethods.pause;
	readonly progress = statusBuilderMethods.progress;
	readonly search = promptBuilderMethods.search;
	readonly select = promptBuilderMethods.select;
	readonly spin = statusBuilderMethods.spin;
	readonly stream = statusBuilderMethods.stream;
	readonly suggest = promptBuilderMethods.suggest;
	readonly table = outputBuilderMethods.table;
	readonly task = statusBuilderMethods.task;
	readonly text = promptBuilderMethods.text;
	readonly textarea = promptBuilderMethods.textarea;
	readonly warning = outputBuilderMethods.warning;

	add(step: (responses: FormResponses, previous: unknown, name?: string) => MaybePromise<unknown>, name?: string, ignoreWhenReverting = false): this {
		this.#steps.push({
			condition: true,
			ignoreWhenReverting,
			name,
			run: step,
		});

		return this;
	}

	addIf(
		condition: boolean | ((responses: FormResponses) => boolean),
		step: (responses: FormResponses, previous: unknown, name?: string) => MaybePromise<unknown>,
		name?: string,
		ignoreWhenReverting = false,
	): this {
		this.#steps.push({
			condition,
			ignoreWhenReverting,
			name,
			run: step,
		});

		return this;
	}

	async submit(): Promise<FormResponses> {
		for (const [index, step] of this.#steps.entries()) {
			const key = step.name ?? index;
			const shouldRun = typeof step.condition === 'function' ? step.condition(this.#responses) : step.condition;

			if (!shouldRun) {
				this.#responses[key] = null;
				continue;
			}

			this.#responses[key] = await step.run(this.#responses, this.#responses[key], step.name);
		}

		return this.#responses;
	}
}
