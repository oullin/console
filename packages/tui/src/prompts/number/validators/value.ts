import { z } from 'zod';
import type { NumberPromptOptions } from '#tui/types';

export type NumberPromptValue = number | string;

export type NumberValidationResult = {
	error?: string;
	value?: NumberPromptValue;
};

const numericInputSchema = z.string();

const isNumeric = (value: string): boolean => value.trim() !== '' && Number.isFinite(Number(value));

export const parseNumberInput = (input: unknown, options: Pick<NumberPromptOptions, 'integer' | 'max' | 'min'> = {}): NumberValidationResult => {
	const raw = numericInputSchema.parse(input);
	const normalized = raw.trim();

	if (normalized === '') {
		return { value: '' };
	}

	if (!isNumeric(normalized)) {
		return { error: 'Must be a number' };
	}

	const numeric = Number(normalized);

	if (options.min !== undefined && numeric < options.min) {
		return { error: `Must be at least ${options.min}` };
	}

	if (options.max !== undefined && numeric > options.max) {
		return { error: `Must be less than ${options.max}` };
	}

	return { value: Math.trunc(numeric) };
};
