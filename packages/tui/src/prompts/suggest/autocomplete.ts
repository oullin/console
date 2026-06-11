import { Key } from '#tui/key';
import { characterLength } from '#tui/typed-value/characters';
import { nextAutocompleteHighlight } from '#tui/prompts/suggest/navigation';
import type { TypedValueState } from '#tui/typed-value/types';

export const autocompleteNavigationDirection = (key: string): 1 | -1 | null => {
	if (key === Key.up || key === Key.upArrow) {
		return -1;
	}

	if (key === Key.down || key === Key.downArrow) {
		return 1;
	}

	return null;
};

export const moveAutocompleteHighlight = (matches: string[], highlighted: number, direction: 1 | -1): number => nextAutocompleteHighlight(matches, highlighted, direction);

export const canAcceptAutocomplete = (state: TypedValueState): boolean => state.cursor >= characterLength(state.value);

export const acceptAutocompleteMatch = (state: TypedValueState, match: string | undefined, requireGrowth: boolean): TypedValueState | null => {
	if (match === undefined) {
		return null;
	}

	if (requireGrowth && match.length <= state.value.length) {
		return null;
	}

	return { cursor: match.length, value: match };
};
