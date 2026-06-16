import { z } from 'zod';
import type { PromptFallbackCondition } from '#tui/prompt/fallback';
import type { PromptFallbackHandler } from '#tui/prompt/fallback';

type PromptFallbackConditionCallback = Exclude<PromptFallbackCondition, boolean>;

const fallbackConditionCallbackSchema = z.function();
const fallbackHandlerSchema = <TOptions, TResult>(): z.ZodType<PromptFallbackHandler<TOptions, TResult>> =>
	z.function() as z.ZodType<PromptFallbackHandler<TOptions, TResult>>;

export const isFallbackConditionCallback = (condition: PromptFallbackCondition): condition is PromptFallbackConditionCallback => {
	return fallbackConditionCallbackSchema.safeParse(condition).success;
};

export const parseFallbackHandler = <TOptions, TResult>(handler: unknown): PromptFallbackHandler<TOptions, TResult> => {
	return fallbackHandlerSchema<TOptions, TResult>().parse(handler);
};
