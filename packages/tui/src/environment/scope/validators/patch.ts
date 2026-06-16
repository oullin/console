import { z } from 'zod';
import type { PromptEnvironment, PromptInput, PromptOutput } from '#tui/types';

const promptInputPatchSchema = z
	.object({
		readKey: z.function().optional(),
		readLine: z.function().optional(),
	})
	.passthrough() as z.ZodType<PromptInput>;

const promptOutputPatchSchema = z
	.object({
		write: z.function(),
	})
	.passthrough() as z.ZodType<PromptOutput>;

const promptEnvironmentPatchSchema = z
	.object({
		error: promptOutputPatchSchema.optional(),
		input: promptInputPatchSchema.optional(),
		interactive: z.boolean().optional(),
		output: promptOutputPatchSchema.optional(),
	})
	.passthrough() as z.ZodType<Partial<PromptEnvironment>>;

export const parsePromptEnvironmentPatch = (environment: Partial<PromptEnvironment>): Partial<PromptEnvironment> => {
	return promptEnvironmentPatchSchema.parse(environment);
};
