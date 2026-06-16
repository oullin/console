import { ansiCloseSequence, parseAnsiSegments } from '#tui/string-utils/ansi';
import { visibleWidth } from '#tui/string-utils/width';

export const truncate = (value: string, width: number, marker = '...'): string => {
	if (width <= 0) {
		return '';
	}

	if (visibleWidth(value) <= width) {
		return value;
	}

	if (width <= visibleWidth(marker)) {
		let clippedMarker = '';

		for (const char of marker) {
			if (visibleWidth(`${clippedMarker}${char}`) > width) {
				break;
			}

			clippedMarker += char;
		}

		return clippedMarker;
	}

	let result = '';
	let activeCodes = '';

	const markerWidth = visibleWidth(marker);

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
			if (visibleWidth(`${result}${char}`) + markerWidth > width) {
				return `${result}${activeCodes === '' ? '' : ansiCloseSequence(activeCodes)}${marker}`;
			}

			result += char;
		}
	}

	return result;
};
