import { moveSearchHighlight } from '#tui/prompts/search/keys';
import { initialRetriedSearchHighlight } from '#tui/prompts/search/navigation';
import type { SearchNavigationAction } from '#tui/prompts/search/keys';
import type { Choice } from '#tui/types';

export type SingleSearchHighlightState<T> = {
	clear(): void;
	move(choices: Array<Choice<T>>, action: SearchNavigationAction): void;
	value(): number | null;
};

export const createSingleSearchHighlightState = <T>(initialChoices: Array<Choice<T>>, attempt: number, scroll?: number): SingleSearchHighlightState<T> => {
	let highlighted: number | null = initialRetriedSearchHighlight(initialChoices, attempt);

	return {
		clear() {
			highlighted = null;
		},
		move(choices, action) {
			highlighted = moveSearchHighlight(choices, highlighted, action, { attempt, retryFirst: true, scroll });
		},
		value() {
			return highlighted;
		},
	};
};
