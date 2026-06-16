import { defaultSearchChoice, selectedSearchValue } from '#tui/prompts/search/read-single/result';
import type { SingleSearchChoiceQuery } from '#tui/prompts/search/read-single/choice-query';
import type { SearchReaderSelection, SearchReadOptions } from '#tui/prompts/search/read-single/types';
import type { Choice } from '#tui/types';

export const defaultSingleSearchSelection = async <T>(options: SearchReadOptions<T>, query: SingleSearchChoiceQuery<T>): Promise<SearchReaderSelection<T>> => {
	await query.resolveChoices();

	if (query.value().value !== '' || options.hasDefault !== true) {
		return { label: '', submitted: false, value: undefined };
	}

	const choice = defaultSearchChoice(query.choices(), options.default, options.hasDefault);

	return { label: choice?.label ?? '', submitted: choice !== undefined, value: choice?.value ?? options.default };
};

export const selectedSingleSearchSelection = <T>(choices: Array<Choice<T>>, highlighted: number | null): SearchReaderSelection<T> => {
	const choice = highlighted === null ? undefined : choices[highlighted];
	const value = selectedSearchValue(choices, highlighted);

	return { label: choice?.label ?? '', submitted: choice !== undefined && value !== undefined, value };
};
