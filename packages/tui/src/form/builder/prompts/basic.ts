import { number, password, text, textarea } from '#tui/prompts/basic';
import { previousNumber, previousString } from '#tui/form/builder/previous';
import type { FormBuilder } from '#tui/form/builder/index';
import type { PromptBuilderMethods } from '#tui/form/builder/prompts/types';

export const basicPromptBuilderMethods: Pick<PromptBuilderMethods, 'number' | 'password' | 'text' | 'textarea'> & ThisType<FormBuilder> = {
	number(label, placeholder = '', defaultValue = 0, required = false, validate = undefined, hint = '', min, max, step, name) {
		return this.add((_, previous) => number(label, placeholder, previousNumber(previous, defaultValue), required, validate, hint, min, max, step), name);
	},
	password(label, placeholder = '', required = false, validate = undefined, hint = '', name, transform = undefined) {
		return this.add(() => password(label, placeholder, required, validate, hint, transform), name);
	},
	text(label, placeholder = '', defaultValue = '', required = false, validate = undefined, hint = '', name, transform = undefined) {
		return this.add((_, previous) => text(label, placeholder, previousString(previous, defaultValue), required, validate, hint, transform), name);
	},
	textarea(label, placeholder = '', defaultValue = '', required = false, validate = undefined, hint = '', rows = 5, name, transform = undefined) {
		return this.add((_, previous) => textarea(label, placeholder, previousString(previous, defaultValue), required, validate, hint, rows, transform), name);
	},
};
