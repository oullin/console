import { alert, datatable, error, info, intro, note, outro, table, warning } from '#tui/output';
import { autocomplete, confirm, multiselect, multisearch, pause, search, select, suggest } from '#tui/prompts/choices';
import { number, password, text, textarea } from '#tui/prompts/basic';
import { progress, spin, stream, task } from '#tui/status';
import type { FormResponses, FormStep } from '#tui/form/types';
import type { ChoiceInput, DataTablePromptOptions, MaybePromise, MultiSearchPromptOptions, SearchPromptOptions, TableOptions, TextPromptOptions } from '#tui/types';
import type { SuggestOptions } from '#tui/prompts/choices';
import type { Logger, Progress } from '#tui/status';

export class FormBuilder {
	readonly #steps: FormStep[] = [];
	readonly #responses: FormResponses = [] as unknown as FormResponses;

	add(step: (responses: FormResponses, previous: unknown) => MaybePromise<unknown>, name?: string, ignoreWhenReverting = false): this {
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
		step: (responses: FormResponses, previous: unknown) => MaybePromise<unknown>,
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

			this.#responses[key] = await step.run(this.#responses, this.#responses[key]);
		}

		return this.#responses;
	}

	text(
		label: string,
		placeholder = '',
		defaultValue = '',
		required: boolean | string = false,
		validate: TextPromptOptions['validate'] = undefined,
		hint = '',
		name?: string,
		transform?: TextPromptOptions['transform'],
	): this {
		return this.add((_, previous) => text(label, placeholder, previous === undefined || previous === null ? defaultValue : String(previous), required, validate, hint, transform), name);
	}

	textarea(
		label: string,
		placeholder = '',
		defaultValue = '',
		required: boolean | string = false,
		validate: TextPromptOptions['validate'] = undefined,
		hint = '',
		rows = 5,
		name?: string,
		transform?: TextPromptOptions['transform'],
	): this {
		return this.add((_, previous) => textarea(label, placeholder, previous === undefined || previous === null ? defaultValue : String(previous), required, validate, hint, rows, transform), name);
	}

	password(
		label: string,
		placeholder = '',
		required: boolean | string = false,
		validate: TextPromptOptions['validate'] = undefined,
		hint = '',
		name?: string,
		transform?: TextPromptOptions['transform'],
	): this {
		return this.add(() => password(label, placeholder, required, validate, hint, transform), name);
	}

	number(
		label: string,
		placeholder = '',
		defaultValue = 0,
		required: boolean | string = false,
		validate: ((value: number) => MaybePromise<string | false | null | undefined>) | undefined = undefined,
		hint = '',
		min?: number,
		max?: number,
		step?: number,
		name?: string,
	): this {
		return this.add((_, previous) => number(label, placeholder, typeof previous === 'number' ? previous : defaultValue, required, validate, hint, min, max, step), name);
	}

	confirm(
		label: string,
		defaultValue = true,
		yes = 'Yes',
		no = 'No',
		required: boolean | string = false,
		validate: ((value: boolean) => MaybePromise<string | false | null | undefined>) | undefined = undefined,
		hint = '',
		name?: string,
	): this {
		return this.add(() => confirm(label, defaultValue, yes, no, required, validate, hint), name);
	}

	select<T>(
		label: string,
		options: Array<ChoiceInput<T>>,
		defaultValue?: T,
		scroll = 5,
		validate: ((value: T) => MaybePromise<string | false | null | undefined>) | undefined = undefined,
		hint = '',
		required: boolean | string = true,
		name?: string,
	): this {
		return this.add((_, previous) => select({ message: label, options, default: previous === undefined ? defaultValue : (previous as T), scroll, validate, hint, required }), name);
	}

	multiselect<T>(
		label: string,
		options: Array<ChoiceInput<T>>,
		defaultValue: T[] = [],
		scroll = 5,
		required: boolean | string = false,
		validate: ((value: T[]) => MaybePromise<string | false | null | undefined>) | undefined = undefined,
		hint = 'Use the space bar to select options.',
		name?: string,
	): this {
		return this.add((_, previous) => multiselect({ message: label, options, default: Array.isArray(previous) ? (previous as T[]) : defaultValue, scroll, required, validate, hint }), name);
	}

	suggest(
		label: string,
		options: SuggestOptions['options'],
		defaultValue = '',
		scroll = 5,
		required: boolean | string = false,
		validate: TextPromptOptions['validate'] = undefined,
		hint = '',
		name?: string,
		transform?: TextPromptOptions['transform'],
	): this {
		return this.add(
			(_, previous) =>
				suggest({ message: label, label, options, default: previous === undefined || previous === null ? defaultValue : String(previous), scroll, required, validate, hint, transform }),
			name,
		);
	}

	autocomplete(
		label: string,
		options: SuggestOptions['options'],
		defaultValue = '',
		required: boolean | string = false,
		validate: TextPromptOptions['validate'] = undefined,
		hint = '',
		name?: string,
		transform?: TextPromptOptions['transform'],
	): this {
		return this.add(
			(_, previous) =>
				autocomplete({ message: label, label, options, default: previous === undefined || previous === null ? defaultValue : String(previous), required, validate, hint, transform }),
			name,
		);
	}

	search<T>(options: SearchPromptOptions<T>, name?: string): this {
		return this.add(() => search(options), name);
	}

	multisearch<T>(options: MultiSearchPromptOptions<T>, name?: string): this {
		return this.add(() => multisearch(options), name);
	}

	spin<T>(callback: () => MaybePromise<T>, message = '', name?: string): this {
		return this.add(() => spin(callback, { message }), name, true);
	}

	task<T>(label: string, callback: (logger: Logger) => MaybePromise<T>, limit = 10, keepSummary = false, subLabel = '', name?: string): this {
		return this.add(() => task(label, callback, limit, keepSummary, subLabel), name);
	}

	pause(message = 'Press enter to continue', name?: string): this {
		return this.add(
			async () => {
				await pause(message);

				return null;
			},
			name,
			true,
		);
	}

	stream(source: AsyncIterable<string> | Iterable<string>, name?: string): this {
		return this.add(
			async () => {
				await stream(source);

				return null;
			},
			name,
			true,
		);
	}

	note(message: string, type: string | null = null, name?: string): this {
		return this.add(
			() => {
				note(message, type);

				return null;
			},
			name,
			true,
		);
	}

	error(message: string, name?: string): this {
		return this.add(
			() => {
				error(message);

				return null;
			},
			name,
			true,
		);
	}

	warning(message: string, name?: string): this {
		return this.add(
			() => {
				warning(message);

				return null;
			},
			name,
			true,
		);
	}

	alert(message: string, name?: string): this {
		return this.add(
			() => {
				alert(message);

				return null;
			},
			name,
			true,
		);
	}

	info(message: string, name?: string): this {
		return this.add(
			() => {
				info(message);

				return null;
			},
			name,
			true,
		);
	}

	intro(message: string, name?: string): this {
		return this.add(
			() => {
				intro(message);

				return null;
			},
			name,
			true,
		);
	}

	outro(message: string, name?: string): this {
		return this.add(
			() => {
				outro(message);

				return null;
			},
			name,
			true,
		);
	}

	table(headersOrOptions: TableOptions | string[] = [], rows: TableOptions['rows'] | null = null, name?: string): this {
		return this.add(
			() => {
				table(headersOrOptions, rows);

				return null;
			},
			name,
			true,
		);
	}

	datatable<T = unknown>(options: DataTablePromptOptions<T>, name?: string): this {
		return this.add(() => datatable(options), name);
	}

	progress<T, R>(label: string, steps: Iterable<T> | number, callback?: (step: T | number, bar: Progress) => MaybePromise<R>, hint = '', name?: string): this {
		return this.add(() => progress(label, steps, callback, hint), name, true);
	}
}
