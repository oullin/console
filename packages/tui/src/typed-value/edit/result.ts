import { fromCharacters } from '#tui/typed-value/characters';
import type { AppliedTypedKey } from '#tui/typed-value/types';

type TypedKeyResultOptions = {
	cancelled?: boolean;
	submitted?: boolean;
};

export const typedKeyResult = (value: string[], cursor: number, options: TypedKeyResultOptions = {}): AppliedTypedKey => ({
	cancelled: options.cancelled ?? false,
	cursor,
	submitted: options.submitted ?? false,
	value: fromCharacters(value),
});
