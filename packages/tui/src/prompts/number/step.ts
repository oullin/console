import type { NumberInputOptions } from '#tui/prompts/number/types';

const numeric = (value: string): boolean => value.trim() !== '' && Number.isFinite(Number(value));

const clamp = (value: number, min?: number, max?: number): number => {
	const clampedMin = min === undefined ? value : Math.max(min, value);

	return max === undefined ? clampedMin : Math.min(max, clampedMin);
};

export const numberStep = (step?: number): number => {
	return step !== undefined && step > 0 ? Math.max(1, Math.trunc(step)) : 1;
};

export const steppedNumberValue = (value: string, direction: 1 | -1, options: NumberInputOptions): string => {
	const step = numberStep(options.step);

	if (value === '') {
		return String(direction === 1 ? (options.min ?? 1) : (options.max ?? 0));
	}

	if (!numeric(value)) {
		return value;
	}

	return String(clamp(Math.trunc(Number(value)) + step * direction, options.min, options.max));
};
