import { z } from 'zod';
import type { BasePromptOptions } from '#tui/types';

const globalValidationOptionsSchema = z.unknown() as z.ZodType<BasePromptOptions<unknown>>;

export const parseGlobalValidationOptions = (options: unknown): BasePromptOptions<unknown> => {
	return globalValidationOptionsSchema.parse(options);
};
