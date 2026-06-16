import { applyTypedKey } from '#tui/typed-value';
import { resolveSearchChoices } from '#tui/prompts/search/choices';
import { displayedSearchChoices } from '#tui/prompts/search/selection';
import type { SearchSelection } from '#tui/prompts/search/selection';
import type { TypedValueState } from '#tui/typed-value/types';
import type { Choice, MultiSearchPromptOptions } from '#tui/types';

type MultiSearchChoiceQuery<T> = {
	applyTypedInput(key: string): Promise<{ cancelled: boolean }>;
	displayedChoices(): Array<Choice<T>>;
	resolveChoices(): Promise<void>;
	value(): TypedValueState;
};

export const createMultiSearchChoiceQuery = <T>(options: MultiSearchPromptOptions<T>, selected: SearchSelection<T>, initialChoices: Array<Choice<T>>): MultiSearchChoiceQuery<T> => {
	let query: TypedValueState = { cursor: 0, value: '' };
	let choices: Array<Choice<T>> = initialChoices;

	const resolveChoices = async (): Promise<void> => {
		choices = await resolveSearchChoices(options.options, query.value);
	};

	return {
		async applyTypedInput(key) {
			const next = applyTypedKey(query, key);

			if (next.cancelled) {
				return { cancelled: true };
			}

			query = { cursor: next.cursor, value: next.value };

			await resolveChoices();

			return { cancelled: false };
		},
		displayedChoices() {
			return displayedSearchChoices(choices, selected, query.value);
		},
		resolveChoices,
		value() {
			return query;
		},
	};
};
