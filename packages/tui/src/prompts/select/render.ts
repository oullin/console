import { promptEnvironment } from '#tui/environment';
import { choiceWindow, renderInteractiveChecklist, renderInteractiveChoices } from '#tui/concerns/choices';
import { resolveInfo } from '#tui/concerns/info';
import { renderScrollbarRows } from '#tui/concerns/scrollbar';
import { renderBox } from '#tui/theme/box';
import { dim, red, strikethrough } from '#tui/theme/styles';
import type { Choice, MultiSelectPromptOptions, SelectPromptOptions } from '#tui/types';

export const renderSelectedChoice = <T>(message: string, choices: Array<Choice<T>>, selected: number, scroll: number | undefined, info: SelectPromptOptions<T>['info']): void => {
	renderInteractiveChoices(message, choices, selected, new Set(), scroll);

	const text = resolveInfo(info, choices[selected]?.value ?? null);

	if (text.length > 0) {
		promptEnvironment().output.write(`${text}\n`);
	}
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
	renderInteractiveChecklist(message, choices, selected, marked, scroll);

	const text = resolveInfo(info, choices[selected]?.value ?? null);
	const summary = scroll !== undefined && choices.length > scroll ? `${marked.size} selected` : '';
	const details = [text, summary].filter((part) => part.length > 0).join(' · ');

	if (details.length > 0) {
		promptEnvironment().output.write(`${details}\n`);
	}

	const labels = [...marked]
		.sort((left, right) => left - right)
		.map((index) => choices[index]?.label)
		.filter((label): label is string => label !== undefined);

	if (labels.length > 0) {
		promptEnvironment().output.write(`Selected: ${labels.join(', ')}\n`);
	}
};

const cancelledChoiceLabel = <T>(choice: Choice<T>): string => {
	const disabled = choice.disabled ? ` (${typeof choice.disabled === 'string' ? choice.disabled : 'disabled'})` : '';
	const hint = choice.hint ? ` ${choice.hint}` : '';

	return strikethrough(`${choice.label}${hint}${disabled}`);
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
