import { choiceWindow } from '#tui/concerns/choices';
import { renderScrollbarRows } from '#tui/concerns/scrollbar';
import { cyan, dim, strikethrough } from '#tui/theme/styles';
import type { Choice } from '#tui/types';

const choiceLabel = <T>(choice: Choice<T>): string => {
	const disabled = choice.disabled ? ` (${typeof choice.disabled === 'string' ? choice.disabled : 'disabled'})` : '';
	const hint = choice.hint ? ` ${choice.hint}` : '';

	return `${choice.label}${hint}${disabled}`;
};

export const renderActiveChoiceRows = <T>(choices: Array<Choice<T>>, selected: number, scroll?: number): string => {
	const window = choiceWindow(choices.length, selected, scroll);

	const rows = choices.slice(window.start, window.end).map((choice, offset) => {
		const index = window.start + offset;
		const label = choiceLabel(choice);

		if (index === selected) {
			return `${cyan('›')} ${cyan('●')} ${label}  `;
		}

		return `  ${dim('○')} ${dim(label)}  `;
	});

	return renderScrollbarRows(rows, window.start, window.end - window.start, choices.length).join('\n');
};

export const renderActiveChecklistRows = <T>(choices: Array<Choice<T>>, selected: number, marked: Set<number>, scroll?: number): string => {
	const window = choiceWindow(choices.length, selected, scroll);

	const rows = choices.slice(window.start, window.end).map((choice, offset) => {
		const index = window.start + offset;
		const active = index === selected;
		const checked = marked.has(index);
		const label = choiceLabel(choice);

		if (active && checked) {
			return `${cyan('› ◼')} ${label}  `;
		}

		if (active) {
			return `${cyan('›')} ◻ ${label}  `;
		}

		if (checked) {
			return `  ${cyan('◼')} ${dim(label)}  `;
		}

		return `  ${dim('◻')} ${dim(label)}  `;
	});

	return renderScrollbarRows(rows, window.start, window.end - window.start, choices.length).join('\n');
};

export const renderCancelledChoiceRows = <T>(choices: Array<Choice<T>>, selected: number, scroll?: number): string => {
	const window = choiceWindow(choices.length, selected, scroll);

	const rows = choices.slice(window.start, window.end).map((choice, offset) => {
		const index = window.start + offset;
		const label = choiceLabel(choice);

		if (index === selected) {
			return `${dim(`› ● ${strikethrough(label)}`)}  `;
		}

		return `${dim(`  ○ ${strikethrough(label)}`)}  `;
	});

	return renderScrollbarRows(rows, window.start, window.end - window.start, choices.length).join('\n');
};

export const renderCancelledChecklistRows = <T>(choices: Array<Choice<T>>, selected: number, marked: Set<number>, scroll?: number): string => {
	const window = choiceWindow(choices.length, selected, scroll);

	const rows = choices.slice(window.start, window.end).map((choice, offset) => {
		const index = window.start + offset;
		const pointer = index === selected ? '›' : ' ';
		const marker = marked.has(index) ? '◼' : '◻';
		const label = choiceLabel(choice);

		return `${dim(`${pointer} ${marker} ${strikethrough(label)}`)}  `;
	});

	return renderScrollbarRows(rows, window.start, window.end - window.start, choices.length).join('\n');
};
