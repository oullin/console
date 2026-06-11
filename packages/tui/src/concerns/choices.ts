import { promptEnvironment } from '#tui/environment';
import type { Choice, ChoiceInput } from '#tui/types';

export const normalizeChoices = <T>(options: Array<ChoiceInput<T>>): Array<Choice<T>> => {
	return options.map((choice) => {
		if (typeof choice === 'object' && choice !== null && 'value' in choice && 'label' in choice) {
			return choice;
		}

		return {
			label: String(choice),
			value: choice as T,
		};
	});
};

export const normalizeSearchChoices = <T>(options: Array<ChoiceInput<T>> | Record<string, string>): Array<Choice<T>> => {
	if (Array.isArray(options)) {
		return normalizeChoices(options);
	}

	return Object.entries(options).map(([value, label]) => ({
		label,
		value: value as T,
	}));
};

export const findChoice = <T>(choices: Array<Choice<T>>, answer: string): Choice<T> | undefined => {
	if (/^\d+$/u.test(answer)) {
		const index = Number.parseInt(answer, 10);

		return choices[index - 1];
	}

	return choices.find((choice) => choice.label === answer || String(choice.value) === answer);
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

const choiceWindow = (total: number, selected: number, scroll?: number): { end: number; start: number } => {
	if (scroll === undefined || scroll <= 0 || scroll >= total) {
		return { end: total, start: 0 };
	}

	const before = Math.floor((scroll - 1) / 2);
	const start = Math.max(0, Math.min(selected - before, total - scroll));

	return { end: start + scroll, start };
};

export const renderInteractiveChoices = <T>(message: string, choices: Array<Choice<T>>, selected: number, marked: Set<number> = new Set(), scroll?: number): void => {
	const environment = promptEnvironment();
	const window = choiceWindow(choices.length, selected, scroll);

	environment.output.write(`${message}\n`);

	for (const [offset, choice] of choices.slice(window.start, window.end).entries()) {
		const index = window.start + offset;
		const pointer = index === selected ? '›' : ' ';
		const checked = marked.size > 0 ? (marked.has(index) ? '[x]' : '[ ]') : '  ';
		const disabled = choice.disabled ? ` (${typeof choice.disabled === 'string' ? choice.disabled : 'disabled'})` : '';
		const hint = choice.hint ? ` ${choice.hint}` : '';

		environment.output.write(`${pointer} ${checked} ${choice.label}${hint}${disabled}\n`);
	}
};
