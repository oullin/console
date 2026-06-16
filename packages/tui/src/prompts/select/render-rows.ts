import { choiceLabel } from '#tui/prompts/select/render-rows/label';
import { renderChoiceWindowRows } from '#tui/prompts/select/render-rows/window';
import { cyan, dim, strikethrough } from '#tui/theme/styles';
import type { Choice } from '#tui/types';

export const renderActiveChoiceRows = <T>(choices: Array<Choice<T>>, selected: number, scroll?: number): string => {
	return renderChoiceWindowRows(choices, selected, scroll, (choice, index) => {
		const label = choiceLabel(choice);

		if (index === selected) {
			return `${cyan('›')} ${cyan('●')} ${label}  `;
		}

		return `  ${dim('○')} ${dim(label)}  `;
	});
};

export const renderActiveChecklistRows = <T>(choices: Array<Choice<T>>, selected: number, marked: Set<number>, scroll?: number): string => {
	return renderChoiceWindowRows(choices, selected, scroll, (choice, index) => {
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
};

export const renderCancelledChoiceRows = <T>(choices: Array<Choice<T>>, selected: number, scroll?: number): string => {
	return renderChoiceWindowRows(choices, selected, scroll, (choice, index) => {
		const label = choiceLabel(choice);

		if (index === selected) {
			return `${dim(`› ● ${strikethrough(label)}`)}  `;
		}

		return `${dim(`  ○ ${strikethrough(label)}`)}  `;
	});
};

export const renderCancelledChecklistRows = <T>(choices: Array<Choice<T>>, selected: number, marked: Set<number>, scroll?: number): string => {
	return renderChoiceWindowRows(choices, selected, scroll, (choice, index) => {
		const pointer = index === selected ? '›' : ' ';
		const marker = marked.has(index) ? '◼' : '◻';
		const label = choiceLabel(choice);

		return `${dim(`${pointer} ${marker} ${strikethrough(label)}`)}  `;
	});
};
