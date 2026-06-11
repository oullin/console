import { findChoice } from '#tui/concerns/choices';
import { PromptValidationError } from '#tui/prompt';
import { resolveSearchChoices } from '#tui/prompts/search/choices';
import type { Choice, MultiSearchPromptOptions, SearchPromptOptions } from '#tui/types';

export const resolveLineSearchChoice = async <T>(options: SearchPromptOptions<T>, query: string): Promise<T | undefined> => {
	const choices = await resolveSearchChoices(options.options, query);

	if (query === '' && options.default !== undefined) {
		return options.default;
	}

	const matched = findChoice(choices, query);

	if (matched?.disabled) {
		return undefined;
	}

	const choice = matched ?? choices.find((candidate) => !candidate.disabled);

	return choice?.value;
};

export const resolveLineMultiSearchChoices = async <T>(options: MultiSearchPromptOptions<T>, query: string): Promise<T[]> => {
	const choices = await resolveSearchChoices(options.options, query);

	if (query === '' && options.default !== undefined) {
		return options.default;
	}

	const parts = query
		.split(',')
		.map((part) => part.trim())
		.filter((part) => part.length > 0);

	const selectedChoices = parts.map((part) => findChoice(choices, part)).filter((choice): choice is Choice<T> => choice !== undefined && !choice.disabled);

	if (selectedChoices.length !== parts.length) {
		throw new PromptValidationError('Please select valid options.');
	}

	return selectedChoices.map((choice) => choice.value);
};
