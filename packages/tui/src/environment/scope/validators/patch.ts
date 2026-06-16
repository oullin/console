import { z } from 'zod';
import type { PromptEnvironment, PromptInput } from '#tui/types';

const promptInputPatchSchema = z
	.object({
		readKey: z.function().optional(),
		readLine: z.function().optional(),
	})
	.passthrough() as z.ZodType<PromptInput>;

const promptEnvironmentPatchSchema = z
	.object({
		error: z.unknown().optional(),
		input: promptInputPatchSchema.optional(),
		interactive: z.boolean().optional(),
		output: z.unknown().optional(),
	})
	.passthrough() as z.ZodType<Partial<PromptEnvironment>>;

export const parsePromptEnvironmentPatch = (environment: Partial<PromptEnvironment>): Partial<PromptEnvironment> => {
	return promptEnvironmentPatchSchema.parse(environment);
};
