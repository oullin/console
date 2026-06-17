import type { BasicPromptBuilderMethods } from '#tui/form/builder/prompts/contracts/basic';
import type { ChoicePromptBuilderMethods } from '#tui/form/builder/prompts/contracts/choices';

export type PromptBuilderMethods = BasicPromptBuilderMethods & ChoicePromptBuilderMethods;
