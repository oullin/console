import type { FormBuilder } from '#tui/form/builder/index';
import type { ConfirmPromptOptions, MaybePromise } from '#tui/types';

export type ConfirmPromptBuilderMethods = {
	confirm(this: FormBuilder, options: ConfirmPromptOptions, name?: string): FormBuilder;
	confirm(
		this: FormBuilder,
		label: string,
		defaultValue?: boolean,
		yes?: string,
		no?: string,
		required?: boolean | string,
		validate?: (value: boolean) => MaybePromise<string | null | undefined>,
		hint?: string,
		name?: string,
		transform?: (value: boolean) => MaybePromise<boolean>,
	): FormBuilder;
};
