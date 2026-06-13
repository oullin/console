import { outputBuilderMethods } from '#tui/form/builder/output';
import { promptBuilderMethods } from '#tui/form/builder/prompts';
import { sideEffectStep } from '#tui/form/builder/step';
import { statusBuilderMethods } from '#tui/form/builder/status';
import { submitFormSteps } from '#tui/form/builder/submit';
import type { OutputBuilderMethods } from '#tui/form/builder/output';
import type { PromptBuilderMethods } from '#tui/form/builder/prompts';
import type { StatusBuilderMethods } from '#tui/form/builder/status';
import type { FormResponses, FormStep, FormStepCondition } from '#tui/form/types';
import type { MaybePromise } from '#tui/types';

export class FormBuilder {
	readonly #steps: FormStep[] = [];
	readonly #responses: FormResponses = [] as unknown as FormResponses;
	readonly alert: OutputBuilderMethods['alert'] = outputBuilderMethods.alert;
	readonly autocomplete: PromptBuilderMethods['autocomplete'] = promptBuilderMethods.autocomplete;
	readonly confirm: PromptBuilderMethods['confirm'] = promptBuilderMethods.confirm;
	readonly clear: OutputBuilderMethods['clear'] = outputBuilderMethods.clear;
	readonly dataTable: OutputBuilderMethods['dataTable'] = outputBuilderMethods.dataTable;
	readonly datatable: OutputBuilderMethods['datatable'] = outputBuilderMethods.datatable;
	readonly error: OutputBuilderMethods['error'] = outputBuilderMethods.error;
	readonly grid: OutputBuilderMethods['grid'] = outputBuilderMethods.grid;
	readonly info: OutputBuilderMethods['info'] = outputBuilderMethods.info;
	readonly intro: OutputBuilderMethods['intro'] = outputBuilderMethods.intro;
	readonly multisearch: PromptBuilderMethods['multisearch'] = promptBuilderMethods.multisearch;
	readonly multiselect: PromptBuilderMethods['multiselect'] = promptBuilderMethods.multiselect;
	readonly note: OutputBuilderMethods['note'] = outputBuilderMethods.note;
	readonly notify: OutputBuilderMethods['notify'] = outputBuilderMethods.notify;
	readonly number: PromptBuilderMethods['number'] = promptBuilderMethods.number;
	readonly outro: OutputBuilderMethods['outro'] = outputBuilderMethods.outro;
	readonly password: PromptBuilderMethods['password'] = promptBuilderMethods.password;
	readonly pause: PromptBuilderMethods['pause'] = promptBuilderMethods.pause;
	readonly progress: StatusBuilderMethods['progress'] = statusBuilderMethods.progress;
	readonly search: PromptBuilderMethods['search'] = promptBuilderMethods.search;
	readonly select: PromptBuilderMethods['select'] = promptBuilderMethods.select;
	readonly spin: StatusBuilderMethods['spin'] = statusBuilderMethods.spin;
	readonly stream: StatusBuilderMethods['stream'] = statusBuilderMethods.stream;
	readonly suggest: PromptBuilderMethods['suggest'] = promptBuilderMethods.suggest;
	readonly table: OutputBuilderMethods['table'] = outputBuilderMethods.table;
	readonly task: StatusBuilderMethods['task'] = statusBuilderMethods.task;
	readonly text: PromptBuilderMethods['text'] = promptBuilderMethods.text;
	readonly textarea: PromptBuilderMethods['textarea'] = promptBuilderMethods.textarea;
	readonly title: OutputBuilderMethods['title'] = outputBuilderMethods.title;
	readonly warning: OutputBuilderMethods['warning'] = outputBuilderMethods.warning;

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
