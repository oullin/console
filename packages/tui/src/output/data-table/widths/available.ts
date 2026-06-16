export const availableDataTableCellWidth = (columnCount: number, maxWidth: number): number => {
	const markerWidth = 1;
	const renderedColumnCount = columnCount + 1;
	const tableOverhead = renderedColumnCount * 3 + 1;
	const scrollbarArea = 2;
	const frameInset = 6;

	return maxWidth - markerWidth - tableOverhead - scrollbarArea - frameInset;
};
