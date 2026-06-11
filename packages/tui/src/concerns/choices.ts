import { promptEnvironment } from '#tui/environment';
import { parseChoiceAnswerIndex, parseChoiceRecordKey } from '#tui/concerns/validators/choice-answer';
import { parseChoice, parseChoiceRecord } from '#tui/concerns/validators/choice';
import { parseOptionalScrollSize } from '#tui/concerns/validators/scroll';
import { renderScrollbarRows } from '#tui/concerns/scrollbar';
import { cyan, dim } from '#tui/theme/styles';
import type { Choice, ChoiceOptions } from '#tui/types';

export const normalizeChoices = <T>(options: ChoiceOptions<T>): Array<Choice<T>> => {
	if (!Array.isArray(options)) {
		const parsed = parseChoiceRecord(options);

		return Object.entries(parsed ?? {}).map(([value, label]) => ({
			label,
			value: parseChoiceRecordKey(value) as T,
		}));
	}

	return options.map((choice) => {
		const parsed = parseChoice<T>(choice);

		if (parsed) {
			return parsed;
		}

		return {
			label: String(choice),
			value: choice as T,
		};
	});
};

export const normalizeSearchChoices = <T>(options: ChoiceOptions<T>): Array<Choice<T>> => normalizeChoices(options);

export const findChoice = <T>(choices: Array<Choice<T>>, answer: string): Choice<T> | undefined => {
	const normalizedAnswer = answer.trim();
	const index = parseChoiceAnswerIndex(normalizedAnswer);

	if (!Number.isNaN(index)) {
		return choices[index - 1];
	}

	return choices.find((choice) => choice.label === normalizedAnswer || String(choice.value) === normalizedAnswer);
};

export const firstEnabledIndex = <T>(choices: Array<Choice<T>>): number => {
	const index = choices.findIndex((choice) => !choice.disabled);

	return index === -1 ? 0 : index;
};

export const nextEnabledIndex = <T>(choices: Array<Choice<T>>, current: number, direction: 1 | -1): number => {
	if (choices.length === 0) {
		return 0;
	}

	let index = current;

	for (let attempts = 0; attempts < choices.length; attempts += 1) {
		index = (index + direction + choices.length) % choices.length;

		if (!choices[index]?.disabled) {
			return index;
		}
	}

	return current;
};

export const choiceWindow = (total: number, selected: number, scroll?: number): { end: number; start: number } => {
	const size = parseOptionalScrollSize(scroll);

	if (size === undefined || size >= total) {
		return { end: total, start: 0 };
	}

	const before = Math.floor((size - 1) / 2);
	const start = Math.max(0, Math.min(selected - before, total - size));

	return { end: start + size, start };
};

export const renderInteractiveChoices = <T>(message: string, choices: Array<Choice<T>>, selected: number, marked: Set<number> = new Set(), scroll?: number): void => {
	const environment = promptEnvironment();
	const window = choiceWindow(choices.length, selected, scroll);

	environment.output.write(`${message}\n`);

	const rows = choices.slice(window.start, window.end).map((choice, offset) => {
		const index = window.start + offset;
		const pointer = index === selected ? '›' : ' ';
		const checked = marked.size > 0 ? (marked.has(index) ? '[x]' : '[ ]') : '  ';
		const disabled = choice.disabled ? ` (${typeof choice.disabled === 'string' ? choice.disabled : 'disabled'})` : '';
		const hint = choice.hint ? ` ${choice.hint}` : '';

		return `${pointer} ${checked} ${choice.label}${hint}${disabled}`;
	});

	for (const row of renderScrollbarRows(rows, window.start, window.end - window.start, choices.length)) {
		environment.output.write(`${row}\n`);
	}
};

export const renderInteractiveChecklist = <T>(message: string, choices: Array<Choice<T>>, selected: number, marked: Set<number>, scroll?: number): void => {
	const environment = promptEnvironment();
	const window = choiceWindow(choices.length, selected, scroll);

	environment.output.write(`${message}\n`);

	const rows = choices.slice(window.start, window.end).map((choice, offset) => {
		const index = window.start + offset;
		const active = index === selected;
		const checked = marked.has(index);
		const pointer = active ? '›' : ' ';
		const marker = checked ? '◼' : '◻';
		const disabled = choice.disabled ? ` (${typeof choice.disabled === 'string' ? choice.disabled : 'disabled'})` : '';
		const hint = choice.hint ? ` ${choice.hint}` : '';
		const label = `${choice.label}${hint}${disabled}`;

		if (active && checked) {
			return `${cyan(`${pointer} ${marker}`)} ${label}`;
		}

		if (active) {
			return `${cyan(pointer)} ${marker} ${label}`;
		}

		if (checked) {
			return `  ${cyan(marker)} ${dim(label)}`;
		}

		return `  ${dim(marker)} ${dim(label)}`;
	});

	for (const row of renderScrollbarRows(rows, window.start, window.end - window.start, choices.length)) {
		environment.output.write(`${row}\n`);
	}
};
