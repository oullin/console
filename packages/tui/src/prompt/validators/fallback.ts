import { z } from 'zod';
import type { PromptFallbackCondition } from '#tui/prompt/fallback';

type PromptFallbackConditionCallback = Exclude<PromptFallbackCondition, boolean>;

const fallbackConditionCallbackSchema = z.function();

export const isFallbackConditionCallback = (condition: PromptFallbackCondition): condition is PromptFallbackConditionCallback => {
	return fallbackConditionCallbackSchema.safeParse(condition).success;
};
