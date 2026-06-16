import { multiSearchSelectedLabels } from '#tui/prompts/search/read-multi/state/selection';
import type { SearchSelection } from '#tui/prompts/search/selection';

export const selectedMultiSearchLabels = <T>(selected: SearchSelection<T>): string[] => {
	return multiSearchSelectedLabels(selected);
};
