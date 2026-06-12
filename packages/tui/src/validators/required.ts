import { z } from 'zod';

const requiredOptionSchema = z.union([z.boolean(), z.string()]).optional();

const invalidRequiredValueSchema = z.union([z.literal(''), z.literal(false), z.null(), z.undefined(), z.array(z.unknown()).length(0)]);

const isInvalidRequiredValue = (value: unknown): boolean => {
	return invalidRequiredValueSchema.safeParse(value).success;
};

export const requiredMessage = (value: unknown, required?: boolean | string): string | undefined => {
	const parsed = requiredOptionSchema.parse(required);

	if (parsed === false || parsed === undefined || !isInvalidRequiredValue(value)) {
		return undefined;
	}

	return typeof parsed === 'string' && parsed.length > 0 ? parsed : 'Required.';
};
