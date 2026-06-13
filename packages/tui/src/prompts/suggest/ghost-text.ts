import { dim, inverse } from '#tui/theme/styles';
import { characterLength, characters, fromCharacters } from '#tui/typed-value/characters';
import { valueWithCursor } from '#tui/typed-value/cursor';
import type { TypedValueState } from '#tui/typed-value/types';

const startsWithInput = (match: string, value: string): boolean => match.toLowerCase().startsWith(value.toLowerCase());

export const autocompleteGhostText = (value: string, match: string | undefined): string => {
	if (value.length === 0 || match === undefined || !startsWithInput(match, value) || characterLength(match) <= characterLength(value)) {
		return '';
	}

	return fromCharacters(characters(match).slice(characterLength(value)));
};

export const autocompleteDisplayValue = (state: TypedValueState, match: string | undefined, placeholder = ''): string => {
	if (state.value.length === 0) {
		return placeholder;
	}

	if (state.cursor < characterLength(state.value)) {
		return valueWithCursor(state.value, state.cursor);
	}

	const ghostText = autocompleteGhostText(state.value, match);

	if (ghostText.length === 0) {
		return valueWithCursor(state.value, state.cursor);
	}

	const [cursorCharacter = '', ...remainingGhost] = characters(ghostText);

	return `${state.value}${inverse(cursorCharacter)}${dim(fromCharacters(remainingGhost))}`;
};
