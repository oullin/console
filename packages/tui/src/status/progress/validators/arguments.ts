import { z } from 'zod';
import { iterableSchema } from '#tui/validators/iterable';

const progressTotalArgumentSchema = z.number();
const progressMessageArgumentSchema = z.string();

const progressStepsArgumentSchema = <T>() => z.union([z.number(), iterableSchema<T>()]);

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
