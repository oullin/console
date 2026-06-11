import { z } from 'zod';

export type TerminalColor = readonly [number, number, number];

const TRUE_COLOR_TERMS = new Set(['truecolor', '24bit']);
const colorSchema = z.tuple([z.number().int().min(0).max(255), z.number().int().min(0).max(255), z.number().int().min(0).max(255)]);

export const defaultForegroundColor = (): TerminalColor => [204, 204, 204];

export const defaultBackgroundColor = (): TerminalColor => [0, 0, 0];

export const terminalSupportsTrueColor = (value = process.env.COLORTERM): boolean => {
	return TRUE_COLOR_TERMS.has(value ?? '');
};

export const parseTerminalColor = (value: unknown, fallback: TerminalColor): TerminalColor => {
	const parsed = colorSchema.safeParse(value);

	return parsed.success ? parsed.data : fallback;
};
