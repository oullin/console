import { z } from 'zod';

const progressTotalArgumentSchema = z.number();
const progressMessageArgumentSchema = z.string();

const progressIterableStepsSchema = <T>() =>
	z.custom<Iterable<T>>((value) => {
		const iterator = (value as { [Symbol.iterator]?: unknown } | null | undefined)?.[Symbol.iterator];

		return typeof iterator === 'function';
	});

const progressStepsArgumentSchema = <T>() => z.union([z.number(), progressIterableStepsSchema<T>()]);

export const isProgressTotalArgument = (value: unknown): value is number => {
	return progressTotalArgumentSchema.safeParse(value).success;
};

export const progressMessageArgument = (value: unknown): string | undefined => {
	const parsed = progressMessageArgumentSchema.safeParse(value);

	return parsed.success ? parsed.data : undefined;
};

export const progressStepsArgument = <T>(
	value: Iterable<T> | number | string | undefined,
): Iterable<T> | number => {
	const steps = value ?? 0;

	if (progressMessageArgumentSchema.safeParse(steps).success) {
		throw new Error('Progress steps must be an iterable or a number.');
	}

	return progressStepsArgumentSchema<T>().parse(steps);
};
