import { moveSearchHighlight } from '#tui/prompts/search/keys';
import type { SearchNavigationAction } from '#tui/prompts/search/keys';
import type { Choice, MultiSearchPromptOptions } from '#tui/types';

export type MultiSearchHighlightState<T> = {
	clear(): void;
	move(choices: Array<Choice<T>>, action: SearchNavigationAction): void;
	value(): number | null;
};

export const createMultiSearchHighlightState = <T>(scroll?: MultiSearchPromptOptions<T>['scroll']): MultiSearchHighlightState<T> => {
	let highlighted: number | null = null;

	return {
		clear() {
			highlighted = null;
		},
		move(choices, action) {
			highlighted = moveSearchHighlight(choices, highlighted, action, { scroll });
		},
		value() {
			return highlighted;
		},
	};
};
