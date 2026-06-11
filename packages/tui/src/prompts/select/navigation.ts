import { Key } from '#tui/key';
import type { Choice } from '#tui/types';

export const parseChoiceIndex = (key: string): number => (/^\d+$/u.test(key) ? Number.parseInt(key, 10) : Number.NaN);

export const previousChoiceKeys = (key: string): boolean => {
	return key === Key.up || key === Key.upArrow || key === Key.left || key === Key.leftArrow || key === Key.shiftTab || key === Key.ctrlP || key === Key.ctrlB || key === 'k' || key === 'h';
};

export const nextChoiceKeys = (key: string): boolean => {
	return key === Key.down || key === Key.downArrow || key === Key.right || key === Key.rightArrow || key === Key.tab || key === Key.ctrlN || key === Key.ctrlF || key === 'j' || key === 'l';
};

export const lastEnabledChoiceIndex = <T>(choices: Array<Choice<T>>): number => {
	let selected = choices.length - 1;

	while (choices[selected]?.disabled && selected > 0) {
		selected -= 1;
	}

	return selected;
};
