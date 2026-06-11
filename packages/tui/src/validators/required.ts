import { z } from 'zod';

const requiredOptionSchema = z.union([z.boolean(), z.string()]).optional();

const isInvalidRequiredValue = (value: unknown): boolean => {
	return value === '' || value === false || value === null || value === undefined || (Array.isArray(value) && value.length === 0);
};

export const requiredMessage = (value: unknown, required?: boolean | string): string | undefined => {
	const parsed = requiredOptionSchema.parse(required);

	if (parsed === false || parsed === undefined || !isInvalidRequiredValue(value)) {
		return undefined;
	}

	return typeof parsed === 'string' && parsed.length > 0 ? parsed : 'Required.';
};
