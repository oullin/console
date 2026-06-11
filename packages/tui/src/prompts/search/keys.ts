import { Key, oneOf } from '#tui/key';
import { firstSearchHighlight, lastSearchHighlight, nextRetriedSearchHighlight, nextSearchHighlight, pageSearchHighlight } from '#tui/prompts/search/navigation';
import type { Choice } from '#tui/types';

export type SearchNavigationAction = 'first' | 'last' | 'next' | 'page-next' | 'page-previous' | 'previous';

type SearchNavigationOptions = {
	controlNavigation?: boolean;
	lineControls?: boolean;
};

type MoveSearchHighlightOptions = {
	attempt?: number;
	retryFirst?: boolean;
	scroll?: number;
};

export const searchNavigationAction = (key: string, options: SearchNavigationOptions = {}): SearchNavigationAction | null => {
	if (key === Key.down || key === Key.downArrow || key === Key.tab || (options.controlNavigation === true && key === Key.ctrlN)) {
		return 'next';
	}

	if (key === Key.up || key === Key.upArrow || key === Key.shiftTab || (options.controlNavigation === true && key === Key.ctrlP)) {
		return 'previous';
	}

	if (key === Key.pageDown) {
		return 'page-next';
	}

	if (key === Key.pageUp) {
		return 'page-previous';
	}

	if (oneOf(options.lineControls === true ? [Key.home, Key.ctrlA] : [Key.home], key)) {
		return 'first';
	}

	if (oneOf(options.lineControls === true ? [Key.end, Key.ctrlE] : [Key.end], key)) {
		return 'last';
	}

	return null;
};

export const clearsSearchHighlight = (key: string): boolean => oneOf([Key.left, Key.leftArrow, Key.right, Key.rightArrow, Key.ctrlB, Key.ctrlF], key) !== undefined;

export const moveSearchHighlight = <T>(choices: Array<Choice<T>>, highlighted: number | null, action: SearchNavigationAction, options: MoveSearchHighlightOptions = {}): number | null => {
	if (action === 'next') {
		return options.retryFirst === true ? nextRetriedSearchHighlight(choices, highlighted, options.attempt ?? 0) : nextSearchHighlight(choices, highlighted, 1);
	}

	if (action === 'previous') {
		return nextSearchHighlight(choices, highlighted, -1);
	}

	if (action === 'page-next') {
		return pageSearchHighlight(choices, highlighted, 1, options.scroll);
	}

	if (action === 'page-previous') {
		return pageSearchHighlight(choices, highlighted, -1, options.scroll);
	}

	if (action === 'first') {
		return firstSearchHighlight(choices);
	}

	return lastSearchHighlight(choices);
};
