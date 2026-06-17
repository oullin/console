import type { FormBuilder } from '#tui/form/builder/index';
import type { ChoicePromptBuilderMethods } from '#tui/form/builder/prompts/types';

import {
	autocompleteFormStep,
	confirmFormStep,
	multisearchFormStep,
	multiselectFormStep,
	pauseFormStep,
	searchFormStep,
	selectFormStep,
	suggestFormStep,
} from '#tui/form/builder/prompts/choice/index';

export const choicePromptBuilderMethods: ChoicePromptBuilderMethods & ThisType<FormBuilder> = {
	autocomplete: autocompleteFormStep,
	confirm: confirmFormStep,
	multisearch: multisearchFormStep,
	multiselect: multiselectFormStep,
	pause: pauseFormStep,
	search: searchFormStep,
	select: selectFormStep,
	suggest: suggestFormStep,
};
