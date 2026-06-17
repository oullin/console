import { promptEnvironment } from '#tui/environment';
import { renderGrid } from '#tui/output/grid';

export const grid = (items: Array<string | number | boolean> = [], maxWidth?: number): void => {
	const rendered = renderGrid(items, maxWidth);

	if (rendered === '') {
		return;
	}

	promptEnvironment().output.write(`${rendered}\n`);
};
