import { Key } from '#tui/key';
import { applyTypedKey } from '#tui/typed-value';
import type { TypedValueState } from '#tui/typed-value/types';

export type DataTableSearchMode = 'browse' | 'search';

export type DataTableSearchState = {
	mode: DataTableSearchMode;
	query: TypedValueState;
};

export const initialDataTableSearchState = (): DataTableSearchState => ({
	mode: 'browse',
	query: { cursor: 0, value: '' },
});

export const startDataTableSearch = (): DataTableSearchState => ({
	mode: 'search',
	query: { cursor: 0, value: '' },
});

export const confirmDataTableSearch = (state: DataTableSearchState): DataTableSearchState => ({
	...state,
	mode: 'browse',
});

export const clearDataTableSearch = (): DataTableSearchState => ({
	mode: 'browse',
	query: { cursor: 0, value: '' },
});

export const applyDataTableSearchKey = (state: DataTableSearchState, key: string): { changed: boolean; state: DataTableSearchState } => {
	if (state.mode !== 'search') {
		return { changed: false, state };
	}

	if (key === Key.enter) {
		return { changed: true, state: confirmDataTableSearch(state) };
	}

	if (key === Key.escape) {
		return { changed: true, state: clearDataTableSearch() };
	}

	const next = applyTypedKey(state.query, key);

	if (next.value === state.query.value && next.cursor === state.query.cursor) {
		return { changed: false, state };
	}

	return {
		changed: true,
		state: {
			mode: 'search',
			query: { cursor: next.cursor, value: next.value },
		},
	};
};
