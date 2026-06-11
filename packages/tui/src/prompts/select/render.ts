import { promptEnvironment } from '#tui/environment';
import { choiceWindow } from '#tui/concerns/choices';
import { resolveInfo } from '#tui/concerns/info';
import { renderScrollbarRows } from '#tui/concerns/scrollbar';
import { renderBox } from '#tui/theme/box';
import { cyan, dim, red, strikethrough } from '#tui/theme/styles';
import type { Choice, MultiSelectPromptOptions, SelectPromptOptions } from '#tui/types';

export const renderSelectedChoice = <T>(message: string, choices: Array<Choice<T>>, selected: number, scroll: number | undefined, info: SelectPromptOptions<T>['info']): void => {
	const text = resolveInfo(info, choices[selected]?.value ?? null);

	promptEnvironment().output.write(`${renderBox({ body: renderActiveChoiceRows(choices, selected, scroll), borderStyle: cyan, info: text, title: cyan(message) })}\n`);
};

export const renderSubmittedChoice = (message: string, label: string): void => {
	promptEnvironment().output.write(`${renderBox({ body: label, title: dim(message) })}\n`);
};

export const renderSubmittedChoices = (message: string, labels: string[]): void => {
	const body = labels.length === 0 ? dim('None') : labels.join('\n');

	promptEnvironment().output.write(`${renderBox({ body, title: dim(message) })}\n`);
};

export const renderCancelledChoice = <T>(message: string, choices: Array<Choice<T>>, selected: number, scroll?: number): void => {
	promptEnvironment().output.write(`${renderBox({ body: renderCancelledChoiceRows(choices, selected, scroll), borderStyle: red, title: message })}\n`);
	promptEnvironment().error.write(`${red('  ⚠ Cancelled.')}\n`);
};

export const renderCancelledChoices = <T>(message: string, choices: Array<Choice<T>>, selected: number, marked: Set<number>, scroll?: number): void => {
	promptEnvironment().output.write(`${renderBox({ body: renderCancelledChecklistRows(choices, selected, marked, scroll), borderStyle: red, title: message })}\n`);
	promptEnvironment().error.write(`${red('  ⚠ Cancelled.')}\n`);
};

export const renderMultipleChoices = <T>(message: string, choices: Array<Choice<T>>, selected: number, marked: Set<number>, scroll?: number, info?: MultiSelectPromptOptions<T>['info']): void => {
	const text = resolveInfo(info, choices[selected]?.value ?? null);
	const summary = scroll !== undefined && choices.length > scroll ? `${marked.size} selected` : '';
	const details = [text, summary].filter((part) => part.length > 0).join(' · ');

	promptEnvironment().output.write(`${renderBox({ body: renderActiveChecklistRows(choices, selected, marked, scroll), borderStyle: cyan, info: details, title: cyan(message) })}\n`);
};

const choiceLabel = <T>(choice: Choice<T>): string => {
	const disabled = choice.disabled ? ` (${typeof choice.disabled === 'string' ? choice.disabled : 'disabled'})` : '';
	const hint = choice.hint ? ` ${choice.hint}` : '';

	return `${choice.label}${hint}${disabled}`;
};

const renderActiveChoiceRows = <T>(choices: Array<Choice<T>>, selected: number, scroll?: number): string => {
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

const renderActiveChecklistRows = <T>(choices: Array<Choice<T>>, selected: number, marked: Set<number>, scroll?: number): string => {
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

const cancelledChoiceLabel = <T>(choice: Choice<T>): string => {
	return strikethrough(choiceLabel(choice));
};

const renderCancelledChoiceRows = <T>(choices: Array<Choice<T>>, selected: number, scroll?: number): string => {
	const window = choiceWindow(choices.length, selected, scroll);

	const rows = choices.slice(window.start, window.end).map((choice, offset) => {
		const index = window.start + offset;
		const marker = index === selected ? '› ●' : '  ○';

		return dim(`${marker} ${cancelledChoiceLabel(choice)}  `);
	});

	return renderScrollbarRows(rows, window.start, window.end - window.start, choices.length, dim).join('\n');
};

const renderCancelledChecklistRows = <T>(choices: Array<Choice<T>>, selected: number, marked: Set<number>, scroll?: number): string => {
	const window = choiceWindow(choices.length, selected, scroll);

	const rows = choices.slice(window.start, window.end).map((choice, offset) => {
		const index = window.start + offset;
		const pointer = index === selected ? '›' : ' ';
		const marker = marked.has(index) ? '◼' : '◻';

		return dim(`${pointer} ${marker} ${cancelledChoiceLabel(choice)}  `);
	});

	return renderScrollbarRows(rows, window.start, window.end - window.start, choices.length, dim).join('\n');
};
