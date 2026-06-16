import { applyTypedKey } from '#tui/typed-value';
import { resolveSearchChoices } from '#tui/prompts/search/choices';
import type { SearchReadOptions } from '#tui/prompts/search/read-single/types';
import type { TypedValueState } from '#tui/typed-value/types';
import type { Choice } from '#tui/types';

type SingleSearchChoiceQuery<T> = {
	applyTypedInput(key: string): Promise<{ cancelled: boolean }>;
	choices(): Array<Choice<T>>;
	resolveChoices(): Promise<void>;
	value(): TypedValueState;
};

export const createSingleSearchChoiceQuery = <T>(options: SearchReadOptions<T>, initialChoices: Array<Choice<T>>): SingleSearchChoiceQuery<T> => {
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
		choices() {
			return choices;
		},
		resolveChoices,
		value() {
			return query;
		},
	};
};
