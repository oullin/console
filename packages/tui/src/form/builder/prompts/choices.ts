import { autocomplete, confirm, multiselect, multisearch, pause, search, select, suggest } from '#tui/prompts/choices';
import { previousArray, previousBoolean, previousString, previousValue } from '#tui/form/builder/previous';
import { isSearchPromptLabel } from '#tui/form/builder/prompts/validators/search';
import type { FormBuilder } from '#tui/form/builder/index';
import type { ChoicePromptBuilderMethods } from '#tui/form/builder/prompts/types';
import type { ChoiceOptions, MultiSearchPromptOptions, SearchPromptOptions } from '#tui/types';

export const choicePromptBuilderMethods: ChoicePromptBuilderMethods & ThisType<FormBuilder> = {
	autocomplete(label, options, placeholder = '', defaultValue = '', required = false, validate = undefined, hint = '', name, transform = undefined) {
		return this.add((_, previous) => autocomplete({ message: label, label, options, placeholder, default: previousString(previous, defaultValue), required, validate, hint, transform }), name);
	},
	confirm(label, defaultValue = true, yes = 'Yes', no = 'No', required = false, validate = undefined, hint = '', name, transform = undefined) {
		return this.add((_, previous) => confirm(label, previousBoolean(previous, defaultValue), yes, no, required, validate, hint, transform), name);
	},
	multisearch<T>(
		optionsOrLabel: MultiSearchPromptOptions<T> | string,
		options?: MultiSearchPromptOptions<T>['options'] | string,
		placeholder = '',
		scroll = 5,
		required: MultiSearchPromptOptions<T>['required'] = false,
		validate: MultiSearchPromptOptions<T>['validate'] = undefined,
		hint = 'Use the space bar to select options.',
		name?: string,
		transform: MultiSearchPromptOptions<T>['transform'] = undefined,
	) {
		if (!isSearchPromptLabel(optionsOrLabel)) {
			return this.add((_, previous) => multisearch<T>({ ...optionsOrLabel, default: previousArray(previous, optionsOrLabel.default ?? []) }), options as string | undefined);
		}

		const promptOptions: MultiSearchPromptOptions<T> = {
			message: optionsOrLabel,
			label: optionsOrLabel,
			options: options as MultiSearchPromptOptions<T>['options'],
			placeholder,
			scroll,
			required,
			validate,
			hint,
			transform,
		};

		return this.add((_, previous) => multisearch<T>({ ...promptOptions, default: previousArray(previous, promptOptions.default ?? []) }), name);
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
	search<T>(
		optionsOrLabel: SearchPromptOptions<T> | string,
		options?: SearchPromptOptions<T>['options'] | string,
		placeholder = '',
		scroll = 5,
		validate: SearchPromptOptions<T>['validate'] = undefined,
		hint = '',
		required: SearchPromptOptions<T>['required'] = true,
		name?: string,
		transform: SearchPromptOptions<T>['transform'] = undefined,
	) {
		if (!isSearchPromptLabel(optionsOrLabel)) {
			return this.add((_, previous) => search<T>({ ...optionsOrLabel, default: previousValue(previous, optionsOrLabel.default) }), options as string | undefined);
		}

		const promptOptions: SearchPromptOptions<T> = {
			message: optionsOrLabel,
			label: optionsOrLabel,
			options: options as SearchPromptOptions<T>['options'],
			placeholder,
			scroll,
			validate,
			hint,
			required,
			transform,
		};

		return this.add((_, previous) => search<T>({ ...promptOptions, default: previousValue(previous, promptOptions.default) }), name);
	},
	select<T>(label: string, options: ChoiceOptions<T>, defaultValue?: T, scroll = 5, validate = undefined, hint = '', required: boolean | string = true, name?: string, transform = undefined) {
		return this.add((_, previous) => select({ message: label, options, default: previousValue(previous, defaultValue), scroll, validate, hint, required, transform }), name);
	},
	suggest(label, options, placeholder = '', defaultValue = '', scroll = 5, required = false, validate = undefined, hint = '', name, transform = undefined) {
		return this.add((_, previous) => suggest({ message: label, label, options, placeholder, default: previousString(previous, defaultValue), scroll, required, validate, hint, transform }), name);
	},
};
