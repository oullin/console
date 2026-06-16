import { parseChoiceAnswerIndex, parseChoiceRecordKey } from '#tui/concerns/validators/choice-answer';
import { parseChoice, parseChoiceOptions } from '#tui/concerns/validators/choice';
import type { Choice, ChoiceOptions } from '#tui/types';

export const normalizeChoices = <T>(options: ChoiceOptions<T>): Array<Choice<T>> => {
	const parsed = parseChoiceOptions(options);

	if (parsed.kind === 'record') {
		return Object.entries(parsed.options).map(([value, label]) => ({
			label,
			value: parseChoiceRecordKey(value) as T,
		}));
	}

	return parsed.options.map((choice) => {
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

export const answerChoiceIndex = (answer: string): number => parseChoiceAnswerIndex(answer.trim());
