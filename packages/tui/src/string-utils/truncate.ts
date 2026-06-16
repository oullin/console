import { ansiCloseSequence, parseAnsiSegments } from '#tui/string-utils/ansi';
import { visibleWidth } from '#tui/string-utils/width';

export const truncate = (value: string, width: number, marker = '...'): string => {
	if (width <= 0) {
		return '';
	}

	const markerWidth = visibleWidth(marker);

	if (visibleWidth(value) <= width) {
		return value;
	}

	if (width <= markerWidth) {
		let clippedMarker = '';
		let clippedWidth = 0;

		for (const char of marker) {
			const charWidth = visibleWidth(char);

			if (clippedWidth + charWidth > width) {
				break;
			}

			clippedMarker += char;
			clippedWidth += charWidth;
		}

		return clippedMarker;
	}

	let result = '';
	let activeCodes = '';
	let resultWidth = 0;

	for (const segment of parseAnsiSegments(value)) {
		if (segment.codes !== activeCodes) {
			if (activeCodes !== '') {
				result += ansiCloseSequence(activeCodes);
			}

			if (segment.codes !== '') {
				result += segment.codes;
			}

			activeCodes = segment.codes;
		}

		for (const char of segment.text) {
			const charWidth = visibleWidth(char);

			if (resultWidth + charWidth + markerWidth > width) {
				return `${result}${activeCodes === '' ? '' : ansiCloseSequence(activeCodes)}${marker}`;
			}

			result += char;
			resultWidth += charWidth;
		}
	}

	return result;
};
