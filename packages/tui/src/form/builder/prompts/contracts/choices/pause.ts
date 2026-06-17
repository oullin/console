import type { FormBuilder } from '#tui/form/builder/index';

export type PausePromptBuilderMethods = {
	pause(this: FormBuilder, message?: string, name?: string): FormBuilder;
};
