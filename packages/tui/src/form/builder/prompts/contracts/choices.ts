import type { AutocompletePromptBuilderMethods } from '#tui/form/builder/prompts/contracts/choices/autocomplete';
import type { ConfirmPromptBuilderMethods } from '#tui/form/builder/prompts/contracts/choices/confirm';
import type { MultiSearchPromptBuilderMethods } from '#tui/form/builder/prompts/contracts/choices/multisearch';
import type { MultiSelectPromptBuilderMethods } from '#tui/form/builder/prompts/contracts/choices/multiselect';
import type { PausePromptBuilderMethods } from '#tui/form/builder/prompts/contracts/choices/pause';
import type { SearchPromptBuilderMethods } from '#tui/form/builder/prompts/contracts/choices/search';
import type { SelectPromptBuilderMethods } from '#tui/form/builder/prompts/contracts/choices/select';
import type { SuggestPromptBuilderMethods } from '#tui/form/builder/prompts/contracts/choices/suggest';

export type ChoicePromptBuilderMethods = AutocompletePromptBuilderMethods &
	ConfirmPromptBuilderMethods &
	MultiSearchPromptBuilderMethods &
	MultiSelectPromptBuilderMethods &
	PausePromptBuilderMethods &
	SearchPromptBuilderMethods &
	SelectPromptBuilderMethods &
	SuggestPromptBuilderMethods;
