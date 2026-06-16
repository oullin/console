import { choiceWindow } from '#tui/concerns/choices';
import { renderScrollbarRows } from '#tui/concerns/scrollbar';
import { choiceDisabledSuffix } from '#tui/theme/choice-disabled';
import { cyan, dim } from '#tui/theme/styles';
import type { Choice } from '#tui/types';

export const renderSearchRows = <T>(choices: Array<Choice<T>>, highlighted: number | null, marked: Set<number>, scroll: number | undefined, multiple: boolean): string => {
	const window = choiceWindow(choices.length, highlighted ?? 0, scroll);

	const rows = choices.slice(window.start, window.end).map((choice, offset) => {
		const index = window.start + offset;
		const active = highlighted === index;
		const selected = marked.has(index);
		const label = choiceLabel(choice);

		return multiple ? multiSearchRow(label, active, selected) : searchRow(label, active);
	});

	return renderScrollbarRows(rows, window.start, window.end - window.start, choices.length).join('\n');
};

const choiceLabel = <T>(choice: Choice<T>): string => {
	const disabled = choiceDisabledSuffix(choice.disabled);
	const hint = choice.hint ? ` ${choice.hint}` : '';

	return `${choice.label}${hint}${disabled}`;
};

const searchRow = (label: string, active: boolean): string => {
	if (active) {
		return `${cyan('›')} ${label}  `;
	}

	return `  ${dim(label)}  `;
};

const multiSearchRow = (label: string, active: boolean, selected: boolean): string => {
	if (active && selected) {
		return `${cyan('› ◼')} ${label}  `;
	}

	if (active) {
		return `${cyan('›')} ◻ ${label}  `;
	}

	if (selected) {
		return `  ${cyan('◼')} ${dim(label)}  `;
	}

	return `  ${dim('◻')} ${dim(label)}  `;
};
