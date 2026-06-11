import { autocomplete, confirm, multiselect, multisearch, pause, search, select, suggest } from '#tui/prompts/choices';
import { previousArray, previousString } from '#tui/form/builder/previous';
import type { FormBuilder } from '#tui/form/builder/index';
import type { PromptBuilderMethods } from '#tui/form/builder/prompts/types';
import type { ChoiceOptions, MultiSearchPromptOptions, SearchPromptOptions } from '#tui/types';

export const choicePromptBuilderMethods: Omit<PromptBuilderMethods, 'number' | 'password' | 'text' | 'textarea'> & ThisType<FormBuilder> = {
	autocomplete(label, options, defaultValue = '', required = false, validate = undefined, hint = '', name, transform = undefined) {
		return this.add((_, previous) => autocomplete({ message: label, label, options, default: previousString(previous, defaultValue), required, validate, hint, transform }), name);
	},
	confirm(label, defaultValue = true, yes = 'Yes', no = 'No', required = false, validate = undefined, hint = '', name, transform = undefined) {
		return this.add(() => confirm(label, defaultValue, yes, no, required, validate, hint, transform), name);
	},
	multisearch<T>(options: MultiSearchPromptOptions<T>, name?: string) {
		return this.add(() => multisearch<T>(options), name);
	},
	multiselect<T>(
		label: string,
		options: ChoiceOptions<T>,
		defaultValue: T[] = [],
		scroll = 5,
		required: boolean | string = false,
		validate = undefined,
		hint = 'Use the space bar to select options.',
		name?: string,
		transform = undefined,
	) {
		return this.add((_, previous) => multiselect({ message: label, options, default: previousArray(previous, defaultValue), scroll, required, validate, hint, transform }), name);
	},
	pause(message = 'Press enter to continue...', name?: string) {
		return this.add(() => pause(message), name);
	},
	search<T>(options: SearchPromptOptions<T>, name?: string) {
		return this.add(() => search<T>(options), name);
	},
	select<T>(label: string, options: ChoiceOptions<T>, defaultValue?: T, scroll = 5, validate = undefined, hint = '', required: boolean | string = true, name?: string, transform = undefined) {
		return this.add((_, previous) => select({ message: label, options, default: previous === undefined ? defaultValue : (previous as T), scroll, validate, hint, required, transform }), name);
	},
	suggest(label, options, defaultValue = '', scroll = 5, required = false, validate = undefined, hint = '', name, transform = undefined) {
		return this.add((_, previous) => suggest({ message: label, label, options, default: previousString(previous, defaultValue), scroll, required, validate, hint, transform }), name);
	},
};
