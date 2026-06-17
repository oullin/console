import { basicPromptBuilderMethods } from '#tui/form/builder/prompts/basic';
import { choicePromptBuilderMethods } from '#tui/form/builder/prompts/choices';
import type { FormBuilder } from '#tui/form/builder/index';
import type { PromptBuilderMethods } from '#tui/form/builder/prompts/types';

export type { PromptBuilderMethods };

export const promptBuilderMethods: PromptBuilderMethods & ThisType<FormBuilder> = {
	...basicPromptBuilderMethods,
	...choicePromptBuilderMethods,
};
